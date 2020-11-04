const html = require('choo/html')
const h = require('hyperscript')
const path = require('path')
const TITLE = 'metadb'
const createRequest = require('../request')
const { readableBytes, secondsToHms } = require('../util')
const basic = require('./basic')
const components = require('../components')
const icons = require('../icons')

module.exports = view

var depth = 0 // TODO is this needed?

function view (state, emit) {
  const request = createRequest(state.connectionSettings)
  if (state.title !== TITLE) emit(state.events.DOMTITLECHANGE, TITLE)
  const file = state.file

  state.newComment = ''
  if (file) {
    if (file.dir) {
      return basic(state, emit, h('div',
        h('h3', h('code.text-reset', file.dir)),
        h('button', { type: 'button', onclick: requestContainingDirectory(file.dir) }, 'Request directory')
      ))
    } else {
      const requested = state.request.find(f => f.sha256 === file.sha256)
      const filenames = Array.isArray(file.filename) ? file.filename : [file.filename]
      file.holders = file.holders || []
      const isAvailable = file.holders.find(h => state.settings.connectedPeers.includes(h))

      const basenames = Array.from(new Set(filenames.map(path.basename)))
      const dirnames = Array.from(new Set(filenames.map(path.dirname)))

      const icon = file.metadata
        ? file.metadata.mimeType.slice(0, 5) === 'audio'
          ? icons.use('music-note') : icons.use('file')
        : icons.use('file')

      return basic(state, emit, h('div',
        basenames.map((basename) => {
          return h('h2', icon, h('code.text-reset', basename))
        }),
        h('div', requested
          ? h('p.text-success', 'File queued for download')
          : h('span',
            h(`button.btn.btn-outline-${isAvailable ? 'success' : 'secondary'}`, { type: 'button', onclick: requestFile }, isAvailable ? 'Download file' : 'Queue file for download')
          )
        ),
        dirnames.map((dirname) => {
          return h('h4',
            icons.use('folder'),
            h('code.text-reset',
              h('a', { href: 'javascript:void(null)', onclick: subdirQuery('') }, '/'),
              dirname.split('/').map(subdir)
            ),
            ' ',
            h(`button.btn.btn-outline-${isAvailable ? 'success' : 'secondary'}`, { type: 'button', onclick: requestContainingDirectory(dirname) }, isAvailable ? 'Download directory' : 'Queue directory for download')
          )
        }),
        item(null, file),
        h('form', { id: 'comment', onsubmit: onSubmitComment },
          h('div.input-group.mb-3',
            h('input.form-control', { type: 'text', id: 'comment', value: state.newComment, name: 'comment', oninput: updateNewComment, placeholder: 'add a comment' }),
            h('div.input-group-append',
              h('input.btn.btn-outline-secondary', { type: 'submit', value: 'comment' })
            )
          )
        ),
        h('button.btn.btn-outline-secondary', { onclick: star }, 'star')
      ))
    }
  } else {
    return basic(state, emit, h('p', 'File not found'))
  }

  function publishComment (commentMessage) {
    request.post(`/files/${file.sha256}`, commentMessage)
      .then((res) => {
        // emit('updateComments', res)
      })
      .catch(console.log)
  }

  function star () {
    publishComment({ star: true })
  }

  function updateNewComment (event) {
    state.newComment = event.target.value
  }

  function onSubmitComment (e) {
    e.preventDefault()
    publishComment({ comment: state.newComment })
  }

  function requestFile () {
    request.post('/request', { files: [file.sha256] })
      .then((res) => {
        emit('transfers', res) // TODO: dont acutally need to pass res
      })
      .catch(console.log) // TODO
  }

  function requestContainingDirectory (subdir) {
    return function () {
      request.post('/files/subdir', { subdir })
        .then((res) => {
          const files = res.data.map(f => f.sha256)
          request.post('/request', { files })
            .then((res) => {
              emit('transfers', res) // TODO: dont acutally need to pass res
            })
            .catch(console.log) // TODO
        }).catch(console.log)
    }
  }

  function displayKey (key) {
    if (key) return h('li', h('strong', `${key}:`))
  }

  function item (key, value) {
    if (key === 'holders' && depth === 0) {
      return h('li',
        h('strong', 'Held by:'),
        h('ul', value.map(components.createDisplayPeer(state)))
      )
    }

    if (value === [] || value === {} || !value) value = ''

    if (key === 'comments') {
      return h('li',
        h('strong', 'Comments:'),
        h('ul', value.map((commentObject) => {
          return h('li',
            components.createDisplayPeer(state, { link: true })(commentObject.author),
            ' ',
            commentObject.comment // TODO markdown?
          )
        }))
      )
    }

    if (key === 'stars') {
      return h('li',
        h('strong', 'Starred by:'),
        h('ul', value.map(components.createDisplayPeer(state)))
        // TODO if it includes us, add unstar button
      )
    }

    if (Array.isArray(value)) {
      value = value.length > 1
        ? JSON.stringify(value)
        : value[0]
    }

    if (typeof value === 'object' && value !== null) {
      // depth += 1
      return html`
        ${displayKey(key)}
        <ul>${Object.keys(value).map(k => item(k, value[k]))}</ul>
        `
    }

    if (['sha256', 'filename'].includes(key)) value = h('code.text-reset', value)

    if (key === 'text' || key === 'pdfText') {
      value = value.replace(/(?:\r\n|\r|\n)/g, '<br>')
        .split('<br>').map(line => html`${line}<br>`)
    }

    if (key === 'timestamp' && typeof value === 'number') {
      key = 'Added'
      value = Date(value)
    }

    if (key === 'size' && typeof value === 'number') {
      value = readableBytes(value)
    }

    if (key === 'duration' && typeof value === 'number') {
      value = secondsToHms(value)
    }

    return h('li', h('strong', `${key}:`), ' ', value)
  }

  // TODO these fns are also in file.js - deduplicate
  function subdir (portion, i, filePath) {
    if (portion === '.') return h('span')

    return h('span', h('a', {
      href: 'javascript:void(null)',
      onclick: subdirQuery(filePath.slice(0, i + 1))
    }, portion), '/')
  }

  function subdirQuery (a) {
    return () => {
      state.subdirQuery = Array.isArray(a) ? a.join('/') : a
      request.post('/files/subdir', { subdir: state.subdirQuery, opts: { oneLevel: true } })
        .then((res) => {
          emit('subdirResult', res)
        })
        .catch(console.log)
    }
  }
}

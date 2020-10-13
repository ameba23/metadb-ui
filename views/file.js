const html = require('choo/html')
const h = require('hyperscript')
const path = require('path')
const TITLE = 'metadb'
const createRequest = require('../request')
const { readableBytes, secondsToHms } = require('../util')
const basic = require('./basic')

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
        h('h3', file.dir),
        h('button', { type: 'button', onclick: requestContainingDirectory }, 'Request directory')
      ))
    } else {
      const filenames = Array.isArray(file.filename) ? file.filename : [file.filename]
      return basic(state, emit, h('div',
        filenames.map((filename) => {
          return h('h3',
            h('a', { href: 'javascript:void(null)', onclick: subdirQuery('') }, '/'),
            ' ',
            path.dirname(filename).split('/').map(subdir),
            path.basename(filename)
          )
        }),
        h('button', { type: 'button', onclick: requestFile }, 'Request file'),
        h('button', { type: 'button', onclick: requestContainingDirectory }, 'Request containing directory'),
        item(null, file),
        h('form', { id: 'comment', onsubmit: onSubmitComment },
          h('input', { type: 'text', id: 'comment', value: state.newComment, name: 'comment', oninput: updateNewComment }),
          h('input', { type: 'submit', value: 'add comment' })
        ),
        h('button', 'star')
      ))
    }
  } else {
    return basic(state, emit, h('p', 'File not found'))
  }

  function updateNewComment (event) {
    state.newComment = event.target.value
  }

  function onSubmitComment (e) {
    e.preventDefault()
    request.post(`/files/${file.sha256}`, { comment: state.newComment })
      .then((res) => {
        emit('updateComments', res)
      })
      .catch(console.log)
  }

  function requestFile () {
    request.post('/request', { files: [file.sha256] })
      .then((res) => {
        emit('transfers', res) // TODO: dont acutally need to pass res
      })
      .catch(console.log) // TODO
  }

  function requestContainingDirectory () {
    let subdir
    if (file.filename) {
      subdir = Array.isArray(file.filename)
        ? path.dirname(file.filename[0]) // TODO how to handle multiple possible dirs
        : path.dirname(file.filename)
    } else if (file.dir) {
      subdir = file.dir
    }

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

  function displayKey (key) {
    if (key) return h('li', h('strong', `${key}:`))
  }

  function displayPeer (peer) {
    const me = (peer === state.settings.key) ? '(You)' : undefined
    const peerName = state.settings.peerNames
      ? state.settings.peerNames[peer] || peer
      : peer
    return h('li', h('a', { href: `#peers/${peer}` }, peerName, me))
  }

  function item (key, value) {
    if (key === 'holders' && depth === 0) {
      return h('li',
        h('strong', 'Held by:'),
        h('ul', value.map(displayPeer))
      )
    }

    if (value === [] || value === {} || !value) value = ''

    if (Array.isArray(value)) {
      value = value.length > 1
        ? JSON.stringify(value)
        : value[0]
    }

    if (typeof value === 'object') {
      // depth += 1
      return html`
        ${displayKey(key)}
        <ul>${Object.keys(value).map(k => item(k, value[k]))}</ul>
        `
    }

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
    }, portion), ' / ')
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

const h = require('hyperscript')
const TITLE = 'metadb'
const path = require('path')
const icons = require('../icons')
const { readableBytes } = require('../util')
const basic = require('./basic')

module.exports = view
module.exports.filesView = filesView

const mainNoFilesMessage = h('div.alert-warning', { role: 'alert' },
  h('p',
    'You currently have no files in the database.  To add some, either ',
    h('a', { href: '#connection' }, 'connect to a swarm'), ' or ', h('a', { href: '#shares' }, 'add some files'), ' yourself.')
)

function view (state, emit) {
  if (state.title !== TITLE) emit(state.events.DOMTITLECHANGE, TITLE)
  return basic(state, emit,
    h('div',
      h('button.btn.btn-outline-secondary.btn-sm', { onclick: function () { emit('chronological') } }, 'Recently added'),
      ' ',
      h('button.btn.btn-outline-secondary.btn-sm', {
        onclick: function () {
          emit('subdirQuery', '')
        }
      }, 'Directory view'),
      filesView(state, emit, 'files', { noFilesMessage: mainNoFilesMessage })
    )
  )
}

function filesView (state, emit, files, options = {}) {
  const request = state.request
  const noFilesMessage = options.noFilesMessage || h('p', 'No files to display')

  const title = (options.subdirQuery || options.subdirQuery === '')
    ? h('div',
      h('h2',
        icons.use('folder'),
        h('code',
          h('a', { href: 'javascript:void(null)', onclick: subdirQuery('') }, ' / '),
          options.subdirQuery.split('/').filter(e => e !== '').slice(0, -1).map(subdir),
          options.subdirQuery.split('/').slice(-1)[0]
        )
      ),
      h('button.btn.btn-sm.btn-outline-secondary.mb-3', {
        type: 'button',
        onclick: function () {
          emit('requestDirectory', options.subdirQuery)
        }
      }, 'Download directory')
    )
    : options.title ? h('h2', options.title) : undefined

  return h('div',
    title,
    h('table.table.table-striped.table-sm',
      h('thead',
        h('tr',
          h('th', { scope: 'col' }, 'Filename'),
          h('th', { scope: 'col' }, 'MIME type'),
          h('th', { scope: 'col' }, 'Size')
        )
      ),
      h('tbody', state[files].map(tableLine))
    ),
    state[files].length
      ? undefined
      : noFilesMessage
  )
  function tableLine (file) {
    if (file.dir) {
      // TODO could also have a button to download the directory
      return h('tr',
        h('td', h('strong', h('a', {
          href: 'javascript:void(null)',
          onclick: subdirQuery(file.fullPath)
        }, icons.use('folder'), ' ', h('code', file.dir)))),
        h('td'),
        h('td')
      )
    }

    const filenames = Array.isArray(file.filename) ? file.filename : [file.filename]
    const requested = state.requests.find(f => f.sha256 === file.sha256)
    file.holders = file.holders || []
    const iHave = file.holders.find(h => h === state.settings.key)
    const isAvailable = file.holders.find(h => state.settings.connectedPeers.includes(h))

    // TODO should we reverse order so basename appears first and less relevant parts of the dir tree later?
    return h('tr',
      h('td',
        iHave
          ? ''
          : requested
            ? h('button.btn.btn-sm.btn-outline-success',
              { type: 'button', disabled: true, title: 'File queued for download' },
              icons.use('file-arrow-down')
            )
            : h(
              `button.btn.btn-sm.btn-outline-${isAvailable ? 'primary' : 'secondary'}`,
              { type: 'button',
                onclick: requestFile(file.sha256),
                title: isAvailable ? 'Download file' : 'Queue file for download'
              },
              icons.use('file-arrow-down')
            ),

        filenames.map((filename) => {
          return h('span',
            options.subdirQuery || options.subdirQuery === ''
              ? ' '
              : h('span', h('a', { href: 'javascript:void(null)', onclick: subdirQuery('') }, ' /'), ' '),
            path.dirname(filename).split('/').map(subdir),
            h('a', { href: `#files/${file.sha256}` }, h('code', path.basename(filename))),
            h('br')
          )
        })
      ),
      h('td', file.metadata.mimeType),
      h('td', readableBytes(file.size))
    )
  }

  function subdir (portion, i, filePath) {
    if (portion === '.') return h('span')

    return h('span', h('a', {
      href: 'javascript:void(null)',
      onclick: subdirQuery(filePath.slice(0, i + 1))
    }, h('code', portion)), ' / ')
  }

  function subdirQuery (subdir) {
    return () => {
      emit('subdirQuery', subdir)
    }
  }

  function requestFile (sha256) {
    return function () {
      request.post('/request', { files: [sha256] })
        .then((res) => {
          emit('transfers')
        })
        .catch(console.log) // TODO
    }
  }
}

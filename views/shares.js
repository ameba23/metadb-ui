const basic = require('./basic')
const createRequest = require('../request')
const h = require('hyperscript')
const { filesView } = require('./files')
const { spinner } = require('../components')
const icons = require('../icons')

module.exports = view

function view (state, emit) {
  const request = createRequest(state.connectionSettings)
  state.dirToShare = state.settings.homeDir
  return basic(state, emit,
    h('div',
      h('h3', 'shares'),
      h('p', JSON.stringify(state.settings.shares)),
      h('p', 'Index a local directory for sharing:'),
      h('form', { id: 'indexDir', onsubmit: onSubmit },
        h('div.input-group.mb-3',
          h('input.form-control', { type: 'text', id: 'dir', value: state.dirToShare, name: 'dir', size: 60, oninput: updateDirToShare }),
          h('div.input-group-append',
            h('input.btn.btn-outline-secondary', { type: 'submit', value: 'Begin indexing' })
          )
        )
      ),
      (state.wsEvents.indexQueue && state.wsEvents.indexQueue.length)
        ? h('div',
          h('h4', 'Being indexed:'),
          h('ul', state.wsEvents.indexQueue.map(displayIndexQueueItem))
        )
        : undefined,
      indexerLog(),
      // h('p', JSON.stringify(state.shareTotals)),
      h('h4', 'Shared folders'),
      h('ul',
        state.shareTotals.map(displayShareDirectory)
      ),
      filesView(state, emit, 'files')
    )
  )

  function displayIndexQueueItem (dir) {
    const beingIndexed = state.wsEvents.indexingFiles === dir
    return h('li',
      beingIndexed ? spinner() : icons.use('folder'),
      h('code.text-reset', dir),
      ' ',
      beingIndexed
        ? h('span',
          h('button.btn.btn-outline-secondary',
            { onclick: pauseIndexing }, 'Pause indexing'
          ),
          ' '
        )
        : undefined,
      h('button.btn.btn-outline-danger', { onclick: stopIndexing(dir) }, 'Cancel indexing')
    )
  }

  function displayShareDirectory (shareDirectory) {
    return h('li',
      icons.use('folder'), ' ',
      h('code.text-reset', shareDirectory.dir),
      ` - ${shareDirectory.numberFiles} files. `,
      h('button.btn.btn-outline-secondary', { onclick: rescan(shareDirectory.dir) }, 'Rescan'),
      ' ',
      h('button.btn.btn-outline-danger', { onclick: stopSharing(shareDirectory.dir) }, 'Stop sharing (TODO)')
    )
    // shareDirectory.bytes
  }

  function updateDirToShare (event) {
    state.dirToShare = event.target.value
  }

  function stopSharing (dir) {
    return function () {
      // TODO
    }
  }

  function rescan (dir) {
    return function () {
      request.post('/files/index', { dir })
        .then((res) => {
          emit('indexFiles', res)
        })
        .catch(console.log)
    }
  }

  function onSubmit (e) {
    e.preventDefault()
    request.post('/files/index', { dir: state.dirToShare })
      .then((res) => {
        // emit('indexFiles', res)
      })
      .catch(console.log)
  }

  function stopIndexing (dir) {
    return function () {
      request.delete('/files/index', { dir })
        .then((res) => {

        })
        .catch(console.log)
    }
  }

  function pauseIndexing () {
    request.get('/files/index/pause')
      .then((res) => {
        // TODO
      })
      .catch(console.log)
  }

  function indexerLog () {
    return (state.wsEvents.indexLog && state.wsEvents.indexLog.length)
      ? h('div.card',
        h('div.card-header', 'Indexer console output'),
        h('div.card-body',
          h('pre.pre-scrollable', state.wsEvents.indexerLog)
        )
      )
      : undefined
  }
}

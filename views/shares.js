const basic = require('./basic')
const h = require('hyperscript')
const { filesView } = require('./files')
const { spinner } = require('../components')
const icons = require('../icons')
const treeTable = require('../components/tree-table')

module.exports = view

function view (state, emit) {
  // state.dirToShare = state.settings.homeDir
  state.dirToShare = 'homedir'

  const ownName = state.files['/']
    ? state.files['/'].find(f => f.mode === 16895).name
    : undefined

  return basic(state, emit,
    h('div',
      h('p', 'Index a local directory for sharing:'),
      h('form', { id: 'indexDir', onsubmit: onSubmit },
        h('div.input-group.mb-3',
          h('input.form-control', { type: 'text', id: 'dir', value: state.dirToShare, name: 'dir', size: 60, oninput: updateDirToShare }),
          h('div.input-group-append',
            h('input.btn.btn-outline-secondary', { type: 'submit', value: 'Begin indexing' })
          )
        )
      ),
      h('h4', 'Shared folders'),
      ownName ? treeTable(state, emit, ownName, true) : undefined
      // state.shareTotals.map(displayShareDirectory)
      // filesView(state, emit, 'files')
    )
  )

  function displayShareDirectory (shareDirectory) {
    return h('li',
      icons.use('folder'), ' ',
      h('code.text-reset', shareDirectory.dir),
      ` - ${shareDirectory.numberFiles} files. `,
      // h('button.btn.btn-outline-secondary', { onclick: rescan(shareDirectory.dir) }, 'Rescan'),
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

  function onSubmit (e) {
    e.preventDefault()
  }
}

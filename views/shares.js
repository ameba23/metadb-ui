const basic = require('./basic')
const createRequest = require('../request')
const h = require('hyperscript')
const { filesView } = require('./files')

module.exports = view

function view (state, emit) {
  const request = createRequest(state.connectionSettings)
  state.dirToShare = state.settings.homeDir
  return basic(state, emit,
    h('div',
      h('h3', 'shares'),
      h('p', JSON.stringify(state.settings.shares)),
      h('p', 'Index a directory:'),
      h('form', { id: 'indexDir', onsubmit: onSubmit },
        h('input', { type: 'text', id: 'dir', value: state.dirToShare, name: 'dir', size: 60, oninput: updateDirToShare }),
        h('input', { type: 'submit', value: 'Begin indexing' })
      ),
      h('p', state.wsEvents.indexer),
      filesView(state, emit, 'files')
    )
  )
  // <textarea readonly="readonly">
  // <pre><code>
  // </code></pre>
  // </textarea>

  function updateDirToShare (event) {
    state.dirToShare = event.target.value
  }

  function onSubmit (e) {
    e.preventDefault()
    // var form = e.currentTarget
    // var thing = formData(form)
    request.post('/files/index', { dir: state.dirToShare })
      .then((res) => {
        emit('indexFiles', res)
      })
      .catch(console.log)
  }
}

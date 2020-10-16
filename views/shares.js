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
      h('p', 'Index a local directory for sharing:'),
      h('form', { id: 'indexDir', onsubmit: onSubmit },
        h('div.input-group.mb-3',
          h('input.form-control', { type: 'text', id: 'dir', value: state.dirToShare, name: 'dir', size: 60, oninput: updateDirToShare }),
          h('div.input-group-append',
            h('input.btn.btn-outline-secondary', { type: 'submit', value: 'Begin indexing' })
          )
        )
      ),
  // <input type="text" class="form-control" placeholder="Recipient's username" aria-label="Recipient's username" aria-describedby="button-addon2">
  // <div class="input-group-append">
  //   <button class="btn btn-outline-secondary" type="button" id="button-addon2">Button</button>
  // </div>
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

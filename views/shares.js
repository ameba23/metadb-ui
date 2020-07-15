const basic = require('./basic')
const createRequest = require('../request')
const html = require('choo/html')
const { filesView } = require('./files')
const { formData } = require('../util')

module.exports = view

function view (state, emit) {
  const request = createRequest(state.connectionSettings)
  return basic(state, emit, html`
    <h3>shares</h3>
    <p>${JSON.stringify(state.settings.shares)}</p>
    <p>Index a directory:</p>
    <form id="indexDir" onsubmit="${onSubmit}">
       <input type="text" id="dir" value="${state.settings.homeDir}" name="dir" size="60">
       <input type=submit value="Begin indexing">
    </form>
    <p>${state.wsEvents.indexer}</p>
    ${filesView(state, emit, 'files')}
    `
  )
// <textarea readonly="readonly">
// <pre><code>
// </code></pre>
// </textarea>

  function onSubmit (e) {
    e.preventDefault()
    var form = e.currentTarget
    var thing = formData(form)
    request.post('/files/index', thing)
      .then((res) => {
        emit('indexFiles', res)
      })
      .catch(console.log)
  }
}

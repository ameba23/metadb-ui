const basic = require('./basic')
const request = require('../request')
const html = require('choo/html')
const { filesView } = require('./files')

module.exports = view
// state.settings.shares
function view (state, emit) {
  return basic(state, emit, html`
    <h3>shares</h3>
    <p>${JSON.stringify(state.settings.shares)}</p>
    <p>Index a directory:</p>
    <form id="indexDir" onsubmit="${onSubmit}">
       <input type="text" id="dir" value="${state.settings.homeDir}" name="dir" size="60">
       <input type=submit value="Begin indexing">
    </form>
    ${filesView(state, emit, 'files')}
    `
  )
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

function formData (form) {
  const data = {}
  new FormData(form).forEach((v, k) => {
    data[k] = v
  })
  return data
}

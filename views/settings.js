const html = require('choo/html')
const createRequest = require('../request')
const { formData } = require('../util')
const basic = require('./basic')
module.exports = view

function view (state, emit) {
  const request = createRequest(state.connectionSettings)
  return basic(state, emit, html`
    <h3>Settings</h3>
    <p>Host: ${state.connectionSettings.host} Port: ${state.connectionSetttings.port}</p>
    <p>Current name: ${state.settings.peerNames[state.settings.key]}</p>
    <form id="addname" onsubmit=${onSubmit}>
      <label for="name">Name:</label>
      <input type=text id="name" value="" name="name">
      <input type=submit value="Update name">
    </form>
  `)

  function onSubmit (e) {
    e.preventDefault()
    var form = e.currentTarget
    var thing = formData(form)
    request.post('/settings', thing)
      .then((res) => {
        emit('updateSettings', res)
      })
      .catch(console.log) // TODO
  }
}

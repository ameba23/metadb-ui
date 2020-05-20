const html = require('choo/html')
const createRequest = require('../request')
const { formData } = require('../util')
const basic = require('./basic')
module.exports = view

function view (state, emit) {
  const request = createRequest(state.connectionSettings)
  return basic(state, emit, html`
    <h3>Settings</h3>
    <p>Host: ${state.connectionSettings.host} Port: ${state.connectionSettings.port.toString()}</p>
    <form id="addname" onsubmit=${onSubmit}>
      <p>
        <label for="name">Name: </label>
        <input type=text id="name" value="${state.settings.peerNames[state.settings.key]}" name="name">
      </p>
      <p>
        <label for="downloadPath">Download path: </label>
        <input type="text" id="downloadPath" value="${state.settings.downloadPath}" name="downloadPath">
        <a href="file://${state.settings.downloadPath}">Open downloadpath locally</a>
      </p>
      <input type=submit value="Update settings">
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

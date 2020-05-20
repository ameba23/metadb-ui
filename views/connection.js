const html = require('choo/html')
const createRequest = require('../request')
const { formData } = require('../util')

const basic = require('./basic')
module.exports = view

function view (state, emit) {
  const request = createRequest(state.connectionSettings)
  return basic(state, emit, html`
    <h3>Connections</h3>
    <ul>${state.settings.connections.map(showConnection)}</ul>
    <form id="swarmtopic" onsubmit=${onSubmit}>
      <label for="swarm">Join or create swarm: (by name or key)</label>
      <input type=text id="swarm" value="" name="swarm">
      <input type=submit value="Connect to swarm">
    </form>
    <button onclick=${createPrivateSwarm}>Create private swarm</button>
  `)

  function onSubmit (e) {
    e.preventDefault()
    var form = e.currentTarget
    var thing = formData(form)
    request.post('/swarm', thing)
      .then((res) => {
        emit('updateConnection', res)
      })
      .catch(console.log) // TODO
  }

  function createPrivateSwarm () {
    request.post('/swarm', {})
      .then((res) => {
        emit('updateConnection', res)
      })
      .catch(console.log) // TODO
  }

  function showConnection (connection) {
    const unSwarm = UnSwarm(connection)
    return html`<li>${connection} <button onclick="${unSwarm}">Disconnect</button></li>`
  }

  function UnSwarm (swarm) {
    return function () {
      request.delete('/swarm', { data: { swarm } })
        .then((res) => {
          emit('updateConnection', res)
        })
        .catch(console.log) // TODO
    }
  }
}

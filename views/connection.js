const html = require('choo/html')
const request = require('../request')
const { formData } = require('../util')

const basic = require('./basic')
module.exports = view

function view (state, emit) {
  return basic(html`
    <h3>Connections</h3>
    <ul>${state.settings.connections.map(showConnection)}</ul>
    <form id="swarmtopic" onsubmit=${onSubmit}>
      <label for="swarm">Join new swarm: (by name or key)</label>
      <input type=text id="swarm" value="" name="swarm">
      <input type=submit value="Connect to swarm">
    </form>
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
  function showConnection (con) {
    const unSwarm = UnSwarm(con)
    return html`<li>${con} <button onclick="${unSwarm}">Disconnect</button></li>`
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

const h = require('hyperscript')
const createRequest = require('../request')
const { formData } = require('../util')

const basic = require('./basic')
module.exports = view

function view (state, emit) {
  const request = createRequest(state.connectionSettings)
  return basic(state, emit, h('div',
    h('h3', 'Connections'),
    h('ul', Object.keys(state.settings.swarms).filter(s => state.settings.swarms[s]).map(displaySwarm)),
    h('form', { id: 'swarmtopic', onsubmit: onSubmit },
      h('label', { for: 'swarm' }, 'Join or create new swarm:'),
      h('input', { type: 'text', id: 'swarm', value: '', name: 'swarm' }),
      h('input', { type: 'submit', value: 'Connect to swarm' })
    ),
    h('button', { onclick: privateSwarm }, 'Create private swarm'),
    h('hr'),
    h('ul', Object.keys(state.settings.swarms).filter(s => !state.settings.swarms[s]).map(displaySwarm))
  ))

  function onSubmit (e) {
    e.preventDefault()
    const form = e.currentTarget
    const f = formData(form)
    console.log(f)

    request.post('/swarm', f)
      .then((res) => {
        emit('updateConnection', res)
      })
      .catch(console.log) // TODO
  }

  function privateSwarm () {
    request.post('/swarm', {})
      .then((res) => {
        emit('updateConnection', res)
      })
      .catch(console.log) // TODO
  }

  function displaySwarm (swarm) {
    const unSwarm = UnSwarm(swarm)
    const connectSwarm = ConnectSwarm(swarm)

    const toggleSwarm = state.settings.swarms[swarm]
      ? h('button', { onclick: unSwarm }, 'Disconnect')
      : h('button', { onclick: connectSwarm }, 'Connect')

    return h('li', swarm, toggleSwarm)
  }

  function ConnectSwarm (swarm) {
    return function () {
      request.post('/swarm', { swarm })
        .then((res) => {
          emit('updateConnection', res)
        })
        .catch(console.log) // TODO
    }
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

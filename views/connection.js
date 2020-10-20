const h = require('hyperscript')
const createRequest = require('../request')
const basic = require('./basic')
const icons = require('../icons')

module.exports = view

function view (state, emit) {
  const request = createRequest(state.connectionSettings)
  state.joinSwarmName = ''
  return basic(state, emit, h('div',
    h('h3', 'Connections'),
    state.settings.swarms
      ? h('ul', Object.keys(state.settings.swarms).filter(s => state.settings.swarms[s]).map(displaySwarm))
      : undefined,
    h('form', { id: 'swarmtopic', onsubmit: onSubmit },
      h('div.input-group.mb-3',
        h('input.form-control', {
          type: 'text',
          id: 'swarm',
          value: state.joinSwarmName,
          name: 'swarm',
          oninput: updateJoinSwarmName,
          placeholder: 'Join or create new swarm'
        }),
        h('div.input-group-append',
          h('input.btn.btn-outline-success', { type: 'submit', value: 'Connect to swarm' })
        )
      )
    ),
    h('button.btn.btn-outline-secondary',
      { onclick: privateSwarm, title: 'Generate a difficult to guess swarm name' },
      'Create private swarm'
    ),
    h('hr'),
    state.settings.swarms
      ? h('ul', Object.keys(state.settings.swarms).filter(s => !state.settings.swarms[s]).map(displaySwarm))
      : undefined
  ))

  function updateJoinSwarmName (event) {
    state.joinSwarmName = event.target.value
  }

  function onSubmit (e) {
    e.preventDefault()

    request.post('/swarm', { swarm: state.joinSwarmName })
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
      ? h('button.btn.btn-outline-danger.btn-sm', { onclick: unSwarm }, 'Disconnect')
      : h('button.btn.btn-outline-success.btn-sm', { onclick: connectSwarm }, 'Connect')

    return h('li',
      h('code.text-reset', swarm, ' '),
      h('button.btn.btn-outline-secondary.btn-sm',
        { onclick: copyToClipboard(swarm), title: 'Copy swarm name to clipboard' },
        icons.use('clipboard')
      ),
      ' ',
      toggleSwarm
    )
  }

  function copyToClipboard (text) {
    return function () {
      const listener = function (ev) {
        ev.preventDefault()
        ev.clipboardData.setData('text/plain', text)
      }
      document.addEventListener('copy', listener)
      document.execCommand('copy')
      document.removeEventListener('copy', listener)
    }
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

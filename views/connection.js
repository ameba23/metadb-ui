const h = require('hyperscript')
const basic = require('./basic')
const icons = require('../icons')
const components = require('../components')

module.exports = view

function view (state, emit) {
  // const request = state.request
  state.joinSwarmName = state.joinSwarmName || ''
  // if (state.selectedSwarm && !state.settings.swarms[state.selectedSwarm]) state.selectedSwarm = undefined
  // state.selectedSwarm = state.selectedSwarm || Object.keys(state.settings.swarms).filter(s => state.settings.swarms[s])[0]

  return basic(state, emit, h('div',
    h('h3', 'Connections'),
    h('small.text-muted', 'Connect to other peers by meeting on a swarm "topic".'),
    h('form', { id: 'swarmtopic', onsubmit: onSubmit },
      h('div.input-group.mb-3',
        h('input.form-control', {
          type: 'text',
          id: 'swarm',
          value: state.joinSwarmName,
          name: 'swarm',
          oninput: updateJoinSwarmName,
          placeholder: 'Join or create new swarm',
          title: 'A swarm name can be anything you like'
        }),
        h('div.input-group-append',
          h('input.btn.btn-outline-success', { type: 'submit', value: 'Connect to swarm' })
        )
      )
    ),
    h('button.btn.btn-sm.btn-outline-secondary.mb-3',
      { onclick: connectSwarm('', true), title: 'Generate a difficult to guess swarm name' },
      'Create private swarm'
    ),
    h('div.container',
      h('div.card',
        h('div.card-header', h('h4', 'Connected swarms')),
        h('ul', state.swarms.connected.map((s) => displaySwarm(s, true)))
      ),
      h('ul', state.swarms.disconnected.map((s) => displaySwarm(s, false)))
    )
  ))

  // function short (swarmName) {
  //   return (swarmName.length < 15)
  //     ? swarmName
  //     : swarmName.slice(0, 15) + '...'
  // }

  function updateJoinSwarmName (event) {
    state.joinSwarmName = event.target.value.replace(/ /g, '-')
    if (state.joinSwarmName !== event.target.value) emit('render')
  }

  function onSubmit (e) {
    e.preventDefault()
    state.swarms.connected.push(state.joinSwarmName)
    connectSwarm(state.joinSwarmName, true)()
  }

  function connectSwarm (name, join) {
    return function () {
      emit('request', { swarm: { name, join } })
      state.swarms.currentStateUnkown.push(name)
      emit('render')
    }
  }

  function displaySwarm (swarm, connected) {
    const onclick = connectSwarm(swarm, !connected)

    const toggleSwarm = state.swarms.currentStateUnkown.includes(swarm)
      ? components.spinner()
      : connected
        ? h('button.btn.btn-outline-danger.btn-sm', { onclick }, 'Disconnect')
        : h('button.btn.btn-outline-success.btn-sm', { onclick }, 'Connect')

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
}

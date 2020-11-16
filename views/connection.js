const h = require('hyperscript')
const basic = require('./basic')
const icons = require('../icons')
const components = require('../components')

module.exports = view

function view (state, emit) {
  const request = state.request
  state.joinSwarmName = state.joinSwarmName || ''
  if (state.selectedSwarm && !state.settings.swarms[state.selectedSwarm]) state.selectedSwarm = undefined
  state.selectedSwarm = state.selectedSwarm || Object.keys(state.settings.swarms).filter(s => state.settings.swarms[s])[0]

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
      { onclick: privateSwarm, title: 'Generate a difficult to guess swarm name' },
      'Create private swarm'
    ),
    h('div.container',
      h('div.card',
        h('div.card-header', h('h4', 'Connected swarms')),
        state.settings.swarms
          ? h('ul', Object.keys(state.settings.swarms).filter(s => state.settings.swarms[s]).map(displaySwarm))
          : undefined
      ),
      state.settings.swarms
        ? h('ul', Object.keys(state.settings.swarms).filter(s => !state.settings.swarms[s]).map(displaySwarm))
        : undefined,
      h('div.card',
        h('div.card-header',
          h('h4', { title: 'Wall messages can only be read by peers who know the swarm name' }, icons.use('bricks'), ' Wall messages'),
          h('ul.nav.nav-tabs.card-header-tabs',
            Object.keys(state.settings.swarms).filter(s => state.settings.swarms[s]).map((swarm) => {
              const active = (state.selectedSwarm === swarm) ? '.active' : ''
              return h('li.nav-item', h(`a.nav-link${active}`, { onclick: selectSwarm(swarm) }, short(swarm)))
            })
          )
        ),
        h('div.card-body',
          displayWallMessages(state.selectedSwarm)
        )
      )
    )
  ))

  function short (swarmName) {
    return (swarmName.length < 15)
      ? swarmName
      : swarmName.slice(0, 15) + '...'
  }

  function selectSwarm (swarm) {
    return function () {
      state.selectedSwarm = swarm
      emit('render')
    }
  }

  function updateJoinSwarmName (event) {
    state.joinSwarmName = event.target.value.replace(/ /g, '-')
    if (state.joinSwarmName !== event.target.value) emit('render')
  }

  function onSubmit (e) {
    e.preventDefault()

    request.post('/swarm', { swarm: state.joinSwarmName })
      .then((res) => {
        state.joinSwarmName = ''
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

  function displayWallMessages (swarm) {
    if (!swarm) return undefined
    state.newWallMessages[swarm] = state.newWallMessages[swarm] || ''
    if (!state.wallMessages[swarm]) return undefined
    return h('div.overflow-auto',
      h('table', state.wallMessages[swarm].map((wallMessage) => {
        return h('tr',
          h('td', components.createDisplayPeer(state, { linkOnly: true, veryShort: true })(wallMessage.author)),
          h('td',
            components.markdown(wallMessage.message)
          )
        )
      })),
      h('form', { id: `createWallMessage${swarm}`, onsubmit: onSubmitWallMessage },
        h('div.input-group.mb-3',
          h('input.form-control', { type: 'text', id: 'wallMessage', value: state.newWallMessages[swarm], name: 'wall-message', oninput: updateWallMessage, placeholder: `write on the wall` }),
          h('div.input-group-append',
            h('input.btn.btn-outline-secondary', { type: 'submit', value: 'submit' })
          )
        )
      )
    )

    function updateWallMessage (event) {
      state.newWallMessages[swarm] = event.target.value
    }

    function onSubmitWallMessage (e) {
      e.preventDefault()
      request.post('/wall-message', { message: state.newWallMessages[swarm], swarmKey: swarm })
        .then((res) => {
          state.newWallMessages[swarm] = ''
        })
        .catch(console.log)
    }
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

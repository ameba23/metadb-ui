const h = require('hyperscript')
const basic = require('./basic')
const { createDisplayPeer } = require('../components')
const TITLE = 'metadb - peers'

module.exports = view

function view (state, emit) {
  if (state.title !== TITLE) emit(state.events.DOMTITLECHANGE, TITLE)
  state.inputAddPeer = state.inputAddPeer || ''

  return basic(state, emit,
    h('div',
      h('h2', 'Peers'),
      h('p', `${state.settings.connectedPeers.length} peer${state.settings.connectedPeers.length === 1 ? '' : 's'} connected.`),
      h('form', { id: 'swarmtopic', onsubmit: onSubmit },
        h('div.input-group.mb-3',
          h('input.form-control', {
            type: 'text',
            id: 'addpeer',
            value: state.inputAddPeer,
            name: 'addpeer',
            oninput: updateAddPeer,
            placeholder: 'add a peer',
            title: 'you can add a peer'
          }),
          h('div.input-group-append',
            h('input.btn.btn-outline-success', { type: 'submit', value: 'add peer' })
          )
        )
      ),
      h('ul', state.peers.map(createDisplayPeer(state, { long: true })))
    )
  )

  function updateAddPeer (event) {
    state.inputAddPeer = event.target.value
  }

  function onSubmit (e) {
    e.preventDefault()
    const peerToAdd = state.inputAddPeer
    state.inputAddPeer = ''
    emit('addPeer', peerToAdd)
  }
}

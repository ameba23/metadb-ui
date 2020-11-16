const h = require('hyperscript')
const basic = require('./basic')
const { createDisplayPeer } = require('../components')
const TITLE = 'metadb - peers'

module.exports = view

function view (state, emit) {
  if (state.title !== TITLE) emit(state.events.DOMTITLECHANGE, TITLE)

  return basic(state, emit,
    h('div',
      h('h2', 'Peers'),
      h('p', `${state.settings.connectedPeers.length} peer${state.settings.connectedPeers.length === 1 ? '' : 's'} connected.`),
      h('ul', state.peers.map(createDisplayPeer(state, { long: true })))
    )
  )
}

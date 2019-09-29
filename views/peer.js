const html = require('choo/html')
const TITLE = 'metadb - peers'
const basic = require('./basic')

module.exports = view

function view (state, emit) {
  if (state.title !== TITLE) emit(state.events.DOMTITLECHANGE, TITLE)
  const peer = state.peers.find(peer => peer.peerId === state.params.peerId)
  if (peer) {
    return basic(html`
      <h3>${peer.peerId}</h3>
    `)
    // TODO show files this peer is holding
  } else {
    return basic(html`<p> Peer not found</p>`)
  }
}

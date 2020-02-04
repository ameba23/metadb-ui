const html = require('choo/html')
const TITLE = 'metadb - peers'
const basic = require('./basic')
const { filesView } = require('./files')

module.exports = view

function view (state, emit) {
  if (state.title !== TITLE) emit(state.events.DOMTITLECHANGE, TITLE)
  const peer = state.peers.find(peer => peer.feedId === state.params.peerId)
  if (peer) {
    peer.name = peer.name || peer.feedId
    return basic(state, emit, html`
      <h3>${peer.name} - ${peer.numberFiles} files</h3>
      ${filesView(state, emit, 'files')}
    `)
    // TODO show files this peer is holding
  } else {
    return basic(state, emit, html`<p>Peer not found</p>`)
  }
}

const h = require('hyperscript')
const TITLE = 'metadb - peers'
const basic = require('./basic')

module.exports = view

function view (state, emit) {
  function displayPeer (peer) {
    const me = (peer.feedId === state.settings.key) ? '(You)' : undefined
    const name = peer.name || peer.feedId
    const files = peer.numberFiles ? ` - ${peer.numberFiles} files.` : undefined
    const connected = state.settings.connectedPeers.includes(peer.feedId)
      ? ' connected' : ''
    return h('li',
      h('a', { href: `#peers/${peer.feedId}` }, name),
      files, me, connected
    )
  }
  if (state.title !== TITLE) emit(state.events.DOMTITLECHANGE, TITLE)

  return basic(state, emit, h('ul', state.peers.map(displayPeer)))
}

const h = require('hyperscript')
const basic = require('./basic')
const { readableBytes } = require('../util')
const TITLE = 'metadb - peers'

module.exports = view

function view (state, emit) {
  function displayPeer (peer) {
    const me = (peer.feedId === state.settings.key) ? '(You)' : undefined
    const name = peer.name || peer.feedId
    const files = peer.files ? ` - ${peer.files} files. ` : undefined
    const bytes = peer.bytes ? `${readableBytes(peer.bytes)} ` : undefined
    const connected = state.settings.connectedPeers.includes(peer.feedId)
      ? ' connected' : ''
    return h('li',
      h('a', { href: `#peers/${peer.feedId}` }, name),
      files, bytes, me, connected
    )
  }
  if (state.title !== TITLE) emit(state.events.DOMTITLECHANGE, TITLE)

  return basic(state, emit, h('ul', state.peers.map(displayPeer)))
}

const h = require('hyperscript')
const basic = require('./basic')
const { readableBytes } = require('../util')
const TITLE = 'metadb - peers'
const icons = require('../icons')

module.exports = view

function view (state, emit) {
  function displayPeer (peer) {
    const me = (peer.feedId === state.settings.key)
    const name = peer.name || peer.feedId
    const files = peer.files ? ` - ${peer.files} files. ` : undefined
    const bytes = peer.bytes ? `${readableBytes(peer.bytes)} ` : undefined
    const connected = state.settings.connectedPeers.includes(peer.feedId)
    return h('li',
      h(`a.${connected || me ? 'text-success' : 'text-secondary'}`, { href: `#peers/${peer.feedId}` },
        icons.use('person'),
        name,
        files,
        bytes,
        me ? '(You)' : '',
        connected ? ' connected' : ''
      )
    )
  }
  if (state.title !== TITLE) emit(state.events.DOMTITLECHANGE, TITLE)

  return basic(state, emit,
    h('div',
      h('h2', 'peers'),
      h('p', `${state.settings.connectedPeers.length} peers connected.`),
      h('ul', state.peers.map(displayPeer))
    )
  )
}

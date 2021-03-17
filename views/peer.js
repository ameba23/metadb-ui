const h = require('hyperscript')
const basic = require('./basic')
const { filesView } = require('./files')
const { createDisplayPeer } = require('../components')
const TITLE = 'metadb - peer'

module.exports = view

function view (state, emit) {
  if (state.title !== TITLE) emit(state.events.DOMTITLECHANGE, TITLE)
  const peer = state.peers.find(peer => peer.feedId === state.params.peerId)
  if (peer) {
    peer.name = peer.name || peer.feedId
    peer.stars = peer.stars || 0
    return basic(state, emit,
      h('div',
        h('h3', createDisplayPeer(state, { short: true })(peer)),
        peer.stars.length
          ? h('div',
            h('h4', 'Starred files'),
            h('ul', peer.stars.map(displayStarredFile))
          )
          : undefined,
        filesView(state, emit, 'files')
      )
    )
  } else {
    return basic(state, emit, h('p', 'Peer not found'))
  }

  function displayStarredFile (star) {
    return h('li', h('a', { href: `#files/${star}` }, star))
  }
}

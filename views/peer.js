const h = require('hyperscript')
const TITLE = 'metadb - peers'
const basic = require('./basic')
const { filesView } = require('./files')

module.exports = view

function view (state, emit) {
  if (state.title !== TITLE) emit(state.events.DOMTITLECHANGE, TITLE)
  const peer = state.peers.find(peer => peer.feedId === state.params.peerId)
  if (peer) {
    peer.name = peer.name || peer.feedId
    return basic(state, emit,
      h('div',
        // h('h3', `${peer.name} - ${peer.numberFiles} files`),
        h('h3', `${peer.name} - ${peer.files} files`),
        filesView(state, emit, 'files')
      )
    )
  } else {
    return basic(state, emit, h('p', 'Peer not found'))
  }
}

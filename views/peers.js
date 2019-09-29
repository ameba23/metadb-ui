const html = require('choo/html')
const TITLE = 'metadb - peers'
const basic = require('./basic')

module.exports = view

function displayPeer (peer) {
  return html`<li><a href="/peers/${peer.peerId}">${peer.peerId}</a> - ${peer.numberFiles} files.</li>`
}

function view (state, emit) {
  if (state.title !== TITLE) emit(state.events.DOMTITLECHANGE, TITLE)

  return basic(html`<ul>${state.peers.map(displayPeer)}</ul>`)
}

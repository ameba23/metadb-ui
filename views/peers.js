const html = require('choo/html')
const TITLE = 'metadb - peers'
const basic = require('./basic')

module.exports = view

function displayPeer (peer) {
  peer.name = peer.name || peer.peerId
  return html`<li><a href="/peers/${peer.peerId}">${peer.name}</a> - ${peer.numberFiles} files.</li>`
}

function view (state, emit) {
  if (state.title !== TITLE) emit(state.events.DOMTITLECHANGE, TITLE)

  return basic(state, emit, html`<ul>${state.peers.map(displayPeer)}</ul>`)
}

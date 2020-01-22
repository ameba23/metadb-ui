const html = require('choo/html')
const TITLE = 'metadb - peers'
const basic = require('./basic')

module.exports = view

function view (state, emit) {
  function displayPeer (peer) {
    const me = (peer.feedId === state.settings.key) ? '(You)' : undefined 
    const name = peer.name || peer.feedId
    const files = peer.numberFiles ? ` - ${peer.numberFiles} files.` : undefined 
    return html`<li><a href="#peers/${peer.feedId}">${name}</a>${files}${me}</li>`
  }
  if (state.title !== TITLE) emit(state.events.DOMTITLECHANGE, TITLE)

  return basic(state, emit, html`<ul>${state.peers.map(displayPeer)}</ul><p>${JSON.stringify(state.peers)}</p>`)
}
// const html = require('choo/html')
// const TITLE = 'metadb - peers'
// const basic = require('./basic')
// const h = require('hyperscript')
//
// module.exports = view
//
// function displayPeer (peer) {
//   peer.name = peer.name || peer.peerId
//   return h('li',
//     h('a', { href: `#peers/${peer.peerId}` }, peer.name),
//     ` - ${peer.numberFiles} files.`)
// }
//
// function view (state, emit) {
//   if (state.title !== TITLE) emit(state.events.DOMTITLECHANGE, TITLE)
//
//   return basic(state, emit, html`<ul>${state.peers.map(displayPeer)}</ul>`)
// }

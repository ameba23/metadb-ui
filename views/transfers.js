const html = require('choo/html')
const h = require('hyperscript')
const TITLE = 'metadb - transfers'
const basic = require('./basic')
const createRequest = require('../request')

module.exports = view

function view (state, emit) {
  if (state.title !== TITLE) emit(state.events.DOMTITLECHANGE, TITLE)
  const request = createRequest(state.connectionSettings)

  return basic(state, emit, html`
    <h3>Wish list:</h3>
    <ul>${state.request.map(displayWishListItem)}</ul>
    <h3>Current downloads:</h3>
    <ul>${state.wsEvents.download
    ? Object.keys(state.wsEvents.download).map(displayDownloadingFile)
    : null}
    </ul>
    <h3>Requests received:</h3>
    <ul></ul>
    `)

  // function displayTimestamp (timestamp) {
  //   return new Date(timestamp).toLocaleString()
  // }

  function displayPeer (feedId) {
    const peer = state.peers.find(p => p.feedId === feedId)
    if (!peer) return feedId
    return h('a', { href: `#peers/${peer.feedId}` }, peer.name || peer.feedId)
  }

  function displayWishListItem (file) {
    // TODO
    return h('li',
      h('a', { href: `#files/${file.sha256}` }, file.filename.toString()),
      ' held by: ', file.holders.map(displayPeer),
      h('button', { onclick: unrequest(file.sha256) }, 'Remove from wishlist')
    )
  }

  function unrequest (files) {
    if (!Array.isArray(files)) files = [files]
    request.delete('/request', { files })
      .then((res) => {
        emit('updateConnection', res)
      })
      .catch(console.log) // TODO
  }

  function displayDownloadingFile (name) {
    const properties = state.wsEvents.download[name]
    if (properties.downloaded) return html`<li>${name}: Download Complete</li>`
    if (properties.verified) return html`<li>${name}: Download Complete. File Verified</li>`
    const bytesRecieved = properties.bytesRecieved || 0
    const size = properties.size || 0
    const percentage = Math.round(bytesRecieved / size * 100)
    return html`
      <li>${name}: ${properties.bytesRecieved || 0} of ${properties.size || 0} bytes (${percentage}%).</li>
    `
  }
}

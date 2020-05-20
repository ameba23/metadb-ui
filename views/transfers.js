const html = require('choo/html')
const TITLE = 'metadb - transfers'
const basic = require('./basic')
const h = require('hyperscript')

module.exports = view

function view (state, emit) {
  if (state.title !== TITLE) emit(state.events.DOMTITLECHANGE, TITLE)

  function displayTimestamp (timestamp) {
    return new Date(timestamp).toLocaleString()
  }

  function displayPeer (feedId) {
    const peer = state.peers.find(p => p.feedId === feedId)
    if (!peer) return feedId
    return h('a', { href: `#peers/${peer.feedId}` }, peer.name || peer.feedId)
  }

  function displayFile (file) {
    return file
  }
  function displayRequest (request, fromSelf) {
    function displayReply (reply) {
      const who = fromSelf ? 'They' : 'You'
      return h('p', `${who} replied on `, displayTimestamp(reply.timestamp), ' ', reply.link)
    }

    request.replies = request.replies || []
    const peerId = request.recipients.find(r => r !== state.settings.key)
    const peer = peerId ? displayPeer(peerId) : 'unknown peer'
    const requested = fromSelf
      ? h('span', 'you requested ', peer, 's files: ')
      : h('span', peer, ' requested files: ')

    return h('li',
      'On ', displayTimestamp(request.timestamp), ' ',
      requested,
      request.files.map(displayFile),
      request.replies.map(displayReply)
    )
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

  return basic(state, emit, html`
    <h3>Requests sent:</h3>
    <ul>${state.request.fromSelf.map(request => displayRequest(request, true))}</ul>
    <h3>Current downloads:</h3>
    <ul>${state.wsEvents.download
    ? Object.keys(state.wsEvents.download).map(displayDownloadingFile)
    : null}
    </ul>
    <h3>Requests received:</h3>
    <ul>${state.request.fromOthers.map(request => displayRequest(request, false))}</ul>
    `)
}

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
      ? h('span', 'you requested', peer, 's files: ')
      : h('span', peer, ' requested files: ')

    return h('li',
      'On ', displayTimestamp(request.timestamp), ' ',
      requested,
      request.files.map(displayFile),
      request.replies.map(displayReply)
    )
  }

  return basic(state, emit, html`
    <h3>Requests sent:</h3>
    <ul>${state.request.fromSelf.map(displayRequest, true)}</ul>
    <h3>Requests received:</h3>
    <ul>${state.request.fromOthers.map(displayRequest, false)}</ul>
    `)
}

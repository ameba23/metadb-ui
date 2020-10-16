const h = require('hyperscript')
const TITLE = 'metadb - transfers'
const basic = require('./basic')
const createRequest = require('../request')

module.exports = view

function view (state, emit) {
  if (state.title !== TITLE) emit(state.events.DOMTITLECHANGE, TITLE)
  const request = createRequest(state.connectionSettings)

  return basic(state, emit,
    h('div',
      h('h3', 'Wish list:'),
      h('ul', state.request.map(displayWishListItem)),
      h('h3', 'Current downloads:'),
      h('ul', state.wsEvents.download
        ? Object.keys(state.wsEvents.download)
          .filter(f => !state.wsEvents.download[f].downloaded)
          .map(displayDownloadingFile)
        : null
      ),
      h('h3', 'Requests received:'),
      h('ul', h('li', JSON.stringify(state.wsEvents.uploadQueue))),
      h('h3', 'Downloaded:'),
      h('ul', state.wsEvents.download
        ? Object.keys(state.wsEvents.download)
          .filter(f => state.wsEvents.download[f].downloaded)
          .map(displayCompleteFile)
        : null
      ),
      h('h3', 'Downloaded (from db)'),
      h('table.table',
        h('thead',
          h('tr',
            h('th', 'Filename'),
            h('th', 'From'),
            h('th', '')
          )
        ),
        h('tbody',
          state.downloads.map(displayDownloadedFile)
        )
      )
    )
  )

  function displayDownloadedFile (file) {
    const hostAndPort = `${state.connectionSettings.host}:${state.connectionSettings.port}`

    return h('tr',
      h('td', h('a', { href: `#files/${file.hash}` }, file.name)),
      h('td', displayPeer(file.from)),
      h('td',
        h('a.btn.btn-outline-secondary', { href: `${hostAndPort}/downloads/${file.hash}`, target: '_blank' }, h('small', 'Open in browser'))
      )
    )
    // verified (bool)
    // timestamp
  }

  function displayPeer (feedId) {
    const peer = state.peers.find(p => p.feedId === feedId)
    if (!peer) return feedId
    return h('a', { href: `#peers/${peer.feedId}` }, peer.name || peer.feedId)
  }

  function displayWishListItem (file) {
    // TODO
    return h('li',
      h('a', { href: `#files/${file.sha256}` }, file.filename.toString()),
      ' held by: ', file.holders.map(displayPeer)
      // h('button', { onclick: unrequest(file.sha256) }, 'Remove from wishlist')
    )
  }

  // function unrequest (files) {
  //   if (!Array.isArray(files)) files = [files]
  //   request.delete('/request', { data: { files } })
  //     .then((res) => {
  //       emit('transfers')
  //     })
  //     .catch(console.log) // TODO
  // }

  function displayCompleteFile (name) {
    const hash = state.wsEvents.download[name].hash
    const hostAndPort = `${state.connectionSettings.host}:${state.connectionSettings.port}`
    const properties = state.wsEvents.download[name]
    const verifiedMessage = properties.verified
      ? 'File Verified.'
      : properties.cannotVerify ? 'HASH DOES NOT MATCH' : ''
    return h(
      'li',
      `${name} ${verifiedMessage}`,
      // h('button', { onclick: openLocal(name) }, 'Open file locally'),
      h('a', { href: `${hostAndPort}/downloads/${hash}`, target: '_blank' }, 'Open/download file in browser')
    )
  }

  // function openLocal (file) {
  //   request.post('/open', { file })
  //     .then((res) => {
  //     })
  //     .catch(console.log)
  // }

  function displayDownloadingFile (name) {
    const properties = state.wsEvents.download[name]
    const bytesRecieved = properties.bytesRecieved || 0
    const size = properties.size || 0
    const percentage = Math.round(bytesRecieved / size * 100)
    return h(
      'li',
      `${name}: ${properties.bytesRecieved || 0} of ${properties.size || 0} bytes (${percentage}%).`
    )
  }
}

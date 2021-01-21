const h = require('hyperscript')
const raw = require('nanohtml/raw')
const marked = require('marked')
const html = require('nanohtml')
const icons = require('./icons')
const { readableBytes } = require('./util')

module.exports = {
  createDisplayPeer (state, options = {}) {
    // Display customisable amount of information about a peer
    return function displayPeer (peer) {
      if (typeof peer === 'string') peer = state.peers.find(p => p.feedId === peer) || { feedId: peer }

      const name = peer.name || peer.feedId

      let toDisplay = h('span', icons.use('person'), name)
      const isMe = (peer.feedId === state.settings.key)
      const connected = state.settings.connectedPeers.includes(peer.feedId)

      if (!options.veryShort) {
        const files = peer.files ? ` - ${peer.files} files. ` : undefined
        const bytes = peer.bytes ? `${readableBytes(peer.bytes)} ` : undefined

        toDisplay = h('span',
          toDisplay,
          files,
          bytes,
          isMe ? ' (You)' : '',
          connected ? ' - Connected' : ''
        )
        if (options.long) {
          const stars = peer.stars ? ` ${peer.stars.length} starred files` : undefined
          toDisplay = h('span', toDisplay, stars)
        }
      }
      // if (options.short) return short

      toDisplay = h(`a.${connected || isMe ? 'text-success' : 'text-secondary'}`,
        { href: `#peers/${peer.feedId}` },
        toDisplay
      )

      if (options.linkOnly) return toDisplay
      return h('li', toDisplay)
    }
  },

  getPeerName (state, feedId) {
    const { name } = state.peers.find(p => p.feedId === feedId) || {}
    return name
  },

  spinner () {
    return h('div.spinner-border.spinner-border-sm', { role: 'status' },
      h('span.sr-only', 'Loading...')
    )
  },

  markdown (text) {
    return html`${raw(marked(text))}`
  }
}

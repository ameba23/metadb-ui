const icons = require('./icons')
const { readableBytes } = require('./util')
const h = require('hyperscript')

module.exports = {
  createDisplayPeer (state, options = {}) {
    return function displayPeer (peer) {
      if (typeof peer === 'string') peer = state.peers.find(p => p.feedId === peer) || { feedId: peer }

      const isMe = (peer.feedId === state.settings.key)
      const name = peer.name || peer.feedId
      const files = peer.files ? ` - ${peer.files} files. ` : undefined
      const bytes = peer.bytes ? `${readableBytes(peer.bytes)} ` : undefined
      const connected = state.settings.connectedPeers.includes(peer.feedId)

      const toDisplay = h('span',
        icons.use('person'),
        name,
        files,
        bytes,
        isMe ? ' (You)' : '',
        connected ? ' - Connected' : ''
      )

      if (options.short) return toDisplay

      return h('li',
        h(`a.${connected || isMe ? 'text-success' : 'text-secondary'}`,
          { href: `#peers/${peer.feedId}` },
          toDisplay
        )
      )
    }
  },

  spinner () {
    return h('div.spinner-border.spinner-border-sm', { role: 'status' },
      h('span.sr-only', 'Loading...')
    )
  }
}
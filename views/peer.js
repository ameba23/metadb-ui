const h = require('hyperscript')
const basic = require('./basic')
const icons = require('../icons')
const { filesView } = require('./files')
const { createDisplayPeer } = require('../components')
const TITLE = 'harddrive-party - peer'

module.exports = view

function view (state, emit) {
  if (state.title !== TITLE) emit(state.events.DOMTITLECHANGE, TITLE)
  const peer = state.peers.find(peer => peer.feedId === state.params.peerId)
  if (peer) {
    peer.name = peer.name || peer.feedId
    peer.stars = peer.stars || []
    peer.comments = peer.comments || []
    return basic(state, emit,
      h('div',
        h('h3', createDisplayPeer(state, { short: true })(peer)),
        h('strong', 'Public key: '),
        h('code.text-reset', peer.feedId, ' '),
        h('button.btn.btn-outline-secondary.btn-sm',
          { onclick: copyToClipboard(peer.feedId), title: 'Copy public key to clipboard' },
          icons.use('clipboard')
        ),
        h('br'),
        peer.stars.length
          ? h('div',
            h('h4', 'Starred files'),
            h('ul', peer.stars.map(displayStarredFile))
          )
          : undefined,
        peer.comments.length
          ? h('div',
            h('h4', 'Comments on files'),
            h('ul', peer.comments.map(displayFileComment))
          )
          : undefined,
        h('h4', 'Shared files'),
        // TODO
        // const files = peer.files ? ` - ${peer.files} files. ` : undefined
        // const bytes = peer.bytes ? `${readableBytes(peer.bytes)} ` : undefined
        filesView(state, emit, 'files')
      )
    )
  } else {
    return basic(state, emit, h('p', 'Peer not found'))
  }

  function displayStarredFile (file) {
    return h('li',
      h('a', { href: `#files/${file.sha256}` },
        h('code.text-reset', file.filename.toString())
      )
    )
  }

  function displayFileComment (file) {
    // TODO
    if (!file.filename) return
    return h('li',
      h('a', { href: `#files/${file.sha256}` },
        h('code.text-reset', file.filename.toString())
      )
    )
  }

  function copyToClipboard (text) {
    return function () {
      const listener = function (ev) {
        ev.preventDefault()
        ev.clipboardData.setData('text/plain', text)
      }
      document.addEventListener('copy', listener)
      document.execCommand('copy')
      document.removeEventListener('copy', listener)
    }
  }
}

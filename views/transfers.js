const h = require('hyperscript')
const TITLE = 'metadb - transfers'
const basic = require('./basic')
const createRequest = require('../request')
const icons = require('../icons')

module.exports = view

function view (state, emit) {
  if (state.title !== TITLE) emit(state.events.DOMTITLECHANGE, TITLE)
  const request = createRequest(state.connectionSettings)
  const downloadingFiles = state.wsEvents.download
    ? Object.keys(state.wsEvents.download).filter(f => !state.wsEvents.download[f].downloaded)
    : []

  return basic(state, emit,
    h('div',
      h('h3', 'Queued for download:'),
      h('small.text-muted', 'Will be downloaded when a peer which has the file is online and has a download-slot free'),
      h('ul', state.request.map(displayWishListItem)),
      h('h3', 'Downloading:'),
      h('table',
        h('thead',
          h('tr',
            h('th', 'Name'),
            h('th', '')
          )
        ),
        h('tbody',
          downloadingFiles.map(displayDownloadingFile)
        )
      ),
      h('h3', 'Requests received:'),
      h('ul', h('li', JSON.stringify(state.wsEvents.uploadQueue))),
      h('h3', 'Downloaded'),
      h('table.table',
        h('thead',
          h('tr',
            h('th', 'Filename'),
            h('th', 'From'),
            h('th', ''),
            h('th', '')
          )
        ),
        h('tbody',
          state.downloads.map(displayDownloadedFile)
        )
      )
    )
  )

  function displayWishListItem (file) {
    const isDownloading = downloadingFiles.find(f => state.wsEvents.download[f].hash === file.sha256)
    // TODO
    return h('li',
      h('a', { href: `#files/${file.sha256}` }, file.filename.toString()),
      ' held by: ', file.holders.map(displayPeer),
      ' ',
      h('button.btn.btn-sm.btn-outline-danger', { onclick: unrequest(file.sha256) }, 'Cancel request'),
      isDownloading ? ' ISDOWNLOADING!' : ''
    )
  }

  function displayDownloadingFile (name) {
    const properties = state.wsEvents.download[name]
    const bytesRecieved = properties.bytesRecieved || 0
    const size = properties.size || 0
    const percentage = Math.round(bytesRecieved / size * 100)
    return h('tr',
      h('td',
        `${name}: ${properties.bytesRecieved || 0} of ${properties.size || 0} bytes (${percentage}%).`
      ),
      h('td',
        '---------',
        progressBar(percentage)
      )
    )
  }

  function displayDownloadedFile (file) {
    const hostAndPort = `${state.connectionSettings.host}:${state.connectionSettings.port}`

    return h('tr',
      h('td',
        h('a', { href: `#files/${file.hash}` }, file.name),
        file.verified ? h('span.text-success', { title: 'File verified' }, icons.use('check')) : h('strong.text-danger', 'Not verified!')
      ),
      h('td', displayPeer(file.from)),
      h('td',
        h('a.btn.btn-outline-secondary', { href: `${hostAndPort}/downloads/${file.hash}`, target: '_blank' }, h('small', 'Open in browser'))
      ),
      h('td',
        h('small', Date(file.timestamp))
      )
    )
  }

  function displayPeer (feedId) {
    const peer = state.peers.find(p => p.feedId === feedId)
    if (!peer) return feedId
    return h('a', { href: `#peers/${peer.feedId}` }, icons.use('person'), peer.name || peer.feedId)
  }


  function unrequest (files) {
    if (!Array.isArray(files)) files = [files]
    return function () {
      request.delete('/request', { data: { files } })
        .then((res) => {
          emit('transfers')
        })
        .catch(console.log) // TODO
    }
  }


  function progressBar (perc) {
    return h('div.progress',
      h('div.progress-bar.bg-success', { role: 'progressbar', style: `width: ${perc}%`, 'aria-valuenow': perc, 'aria-valuemin': '0', 'aria-valuemax': '100' }, perc)
    )
  }
}

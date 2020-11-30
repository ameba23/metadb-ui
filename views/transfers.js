const h = require('hyperscript')
const TITLE = 'metadb - transfers'
const basic = require('./basic')
const icons = require('../icons')

module.exports = view

function view (state, emit) {
  if (state.title !== TITLE) emit(state.events.DOMTITLECHANGE, TITLE)
  const request = state.request
  const downloadingFiles = state.wsEvents.download
    ? Object.keys(state.wsEvents.download).filter(f => !state.wsEvents.download[f].downloaded)
    : []

  return basic(state, emit,
    h('div',
      h('div.row',
        h('div.col',
          h('h3', 'Queued for download:'),
          h('small.text-muted', 'Will be downloaded when a peer who has the file is online and has a download-slot free'),
          h('ul', state.requests.sort(namesSort).map(displayWishListItem)),
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
        ),
        h('div.col',
          h('h3', 'Requests received:'),
          state.wsEvents.uploadQueue
            ? h('ul', state.wsEvents.uploadQueue.map(displayUploadQueueItem))
            : undefined,
          JSON.stringify(state.wsEvents.upload),
          h('h3', 'Uploaded'),
          h('table.table',
            h('thead',
              h('tr',
                h('th', 'Filename'),
                h('th', 'To'),
                h('th', '')
              )
            ),
            h('tbody',
              state.uploads.map(displayUploadedFile)
            )
          )
        )
      )
    )
  )

  function displayUploadQueueItem (item) {
    return h('li', displayPeer(item.sender),
      h('ul', item.requestMessage.files.map(f => 'boop'))
    )
  }

  function displayWishListItem (file) {
    if (!Array.isArray(file.filename)) file.filename = [file.filename]
    const isDownloading = downloadingFiles.find(f => file.filename.includes(f))
    // TODO
    return h('li',
      h('a', { href: `#files/${file.sha256}` }, file.filename.toString()),
      ' held by: ', file.holders.map(displayPeer),
      ' ',
      h('button.btn.btn-sm.btn-outline-danger', { onclick: unrequest(file.sha256) }, 'Cancel request'),
      isDownloading
        ? displayDownloadingFile(isDownloading)
        : undefined
    )
  }

  function displayDownloadingFile (name) {
    const properties = state.wsEvents.download[name]
    const bytesReceived = properties.bytesReceived || 0
    const size = properties.size || 0
    const percentage = Math.round(bytesReceived / size * 100)
    return h('span',
      `${properties.bytesReceived || 0} of ${properties.size || 0} bytes (${percentage}%).`,
      progressBar(percentage)
    )
  }

  function displayUploadedFile (file) {
    return h('tr',
      h('td', h('a', { href: `#files/${file.hash}` }, h('code.text-reset', file.name))),
      h('td', displayPeer(file.to)),
      h('td', h('small', new Date(parseInt(file.timestamp)).toLocaleString()))
    )
  }

  function displayDownloadedFile (file) {
    const hostAndPort = `${state.connectionSettings.host}:${state.connectionSettings.port}`

    return h('tr',
      h('td',
        h('a', { href: `#files/${file.hash}` }, h('code.text-reset', file.name)),
        file.verified ? h('span.text-success', { title: 'File verified' }, icons.use('check')) : h('strong.text-danger', 'Not verified!')
      ),
      h('td', displayPeer(file.from)),
      h('td',
        h('a.btn.btn-outline-secondary', { href: `${hostAndPort}/downloads/${file.hash}`, target: '_blank' }, h('small', 'Open in browser'))
      ),
      h('td',
        h('small', new Date(parseInt(file.timestamp)).toLocaleString())
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

  function namesSort (a, b) {
    const A = a.filename[0]
    const B = b.filename[0]
    if (A < B) return -1
    if (A > B) return 1
    return 0
  }
}

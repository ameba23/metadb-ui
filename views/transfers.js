const h = require('hyperscript')
const TITLE = 'harddrive-party - transfers'
const basic = require('./basic')
const icons = require('../icons')
const { readableBytes, IMAGE_TYPES, AUDIO_VIDEO_TYPES } = require('../util')

module.exports = view

function view (state, emit) {
  if (state.title !== TITLE) emit(state.events.DOMTITLECHANGE, TITLE)
  const request = state.request
  state.wsEvents.downloaded = state.wsEvents.downloaded || {}
  const downloadingFiles = state.wsEvents.download
    ? Object.keys(state.wsEvents.download).filter(f => !state.wsEvents.downloaded[f])
    : []
  // const downloadingFiles = state.wsEvents.download
  //   ? Object.keys(state.wsEvents.download).filter(f => !state.wsEvents.download[f].downloaded)
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
          state.wsEvents.upload
            ? h('ul', Object.values(state.wsEvents.upload).map(displayUploadingItem))
            : undefined,
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

  // function getTopLevelDirs (files) {
  //   const topLevelDirs = {} // new Map()
  //   for (const file in files) {
  //     // if (!Array.isArray(file.filename)) file.filename = [file.filename]
  //     // for (const f in file.filename) {
  //     //   // topLevelDirs.set(f.split('/')[0], file.hash)
  //     //   if (!topLevelDirs[f.split('/')[0]]) topLevelDirs[f.split('/')[0]] = []
  //     //   topLevelDirs[f.split('/')[0]].push(file.hash)
  //     // }
  //     topLevelDirs[file.hash] = 'bop'
  //   }
  //   return JSON.stringify(topLevelDirs)
  // }

  function displayUploadingItem (item) {
    const bytesSent = item.bytesSent || 0
    const size = item.size || 0
    const percentage = Math.round(bytesSent / size * 100)
    return h('li',
      displayPeer(item.to), ' ',
      h('a', { href: `#files/${item.sha256}` }, h('code.text-reset', item.filename)),
      ` ${readableBytes(bytesSent)} of ${readableBytes(size)} ${percentage}% ${item.kbps} kbps`,
      progressBar(percentage)
    )
  }

  function displayUploadQueueItem (item) {
    return h('li',
      displayPeer(item.to), ' ',
      h('a', { href: `#files/${item.sha256}` }, h('code.text-reset', item.baseDir, '/', item.filePath)),
      (item.offset > 0 || item.length > 0)
        ? `Start: ${item.offset} Length: ${item.length}`
        : undefined
    )
  }

  function displayWishListItem (file) {
    if (!Array.isArray(file.filename)) file.filename = [file.filename]
    const isDownloading = downloadingFiles.find(f => f === file.sha256)
    file.holders = file.holders || []
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
      `${properties.bytesReceived || 0} of ${properties.size || 0} bytes (${percentage}%, ${properties.kbps} kbps).`,
      progressBar(percentage)
    )
  }

  function displayUploadedFile (file) {
    return h('tr',
      h('td', h('a', { href: `#files/${file.hash}` }, h('code.text-reset', file.filename))),
      h('td', displayPeer(file.to)),
      h('td', h('small', new Date(parseInt(file.timestamp)).toLocaleString()))
    )
  }

  function displayDownloadedFile (file) {
    return h('tr',
      h('td',
        h('a', { href: `#files/${file.hash}` }, h('code.text-reset', file.filename)),
        file.verified ? h('span.text-success', { title: 'File verified' }, icons.use('check')) : h('strong.text-danger', 'Not verified!')
      ),
      h('td', displayPeer(file.from)),
      h('td', displayMedia(file)),
      h('td',
        h('small', new Date(parseInt(file.timestamp)).toLocaleString())
      )
    )
  }

  function showOrHideMedia ({ hash, src, type }) {
    const playerOptions = { controls: true, autoplay: true }
    if (state.itemPlaying === hash) {
      state.itemPlaying = false // only play once
      return h(type.split('/')[0], playerOptions, h('source', { src, type }))
    }

    function startPlaying () {
      state.itemPlaying = hash
      emit('render')
    }

    return h('button.btn', { onclick: startPlaying, title: 'Play media' }, icons.use('caret-right-square'))
  }

  function displayMedia (file) {
    const hostAndPort = `${state.connectionSettings.host}:${state.connectionSettings.port}`
    const src = `${hostAndPort}/downloads/${file.hash}`
    const type = file.mimeType

    if (IMAGE_TYPES.includes(type)) return h('img', { src, width: 200, alt: file.filename })
    if (AUDIO_VIDEO_TYPES.includes(type)) return showOrHideMedia({ hash: file.hash, src, type })
    return h('a.btn.btn-outline-secondary', { href: src, target: '_blank' }, h('small', 'Open in browser'))
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
    const A = Array.isArray(a.filename) ? a.filename[0] : ''
    const B = Array.isArray(b.filename) ? b.filename[0] : ''
    if (A < B) return -1
    if (A > B) return 1
    return 0
  }
}

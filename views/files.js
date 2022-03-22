const h = require('hyperscript')
const TITLE = 'harddrive-party - files'
const path = require('path')
const icons = require('../icons')
const { readableBytes, isDir } = require('../util')
const basic = require('./basic')
const renderMedia = require('render-media')
const Readable = require('stream').Readable

module.exports = view

function view (state, emit) {
  if (state.title !== TITLE) emit(state.events.DOMTITLECHANGE, TITLE)

  return basic(state, emit,
    h('div',
      h('ul.list-unstyled.ml-4',
        state.files['/']
          ? state.files['/'].sort(dirsFirst).map(displayFiles('/'))
          : h('li', 'No files to display')
      ),
      // h('p', JSON.stringify(state.files)),
      h('h2', 'Wishlist:'),
      h('p', JSON.stringify(state.wishlist)),
      h('h2', 'Downloads:'),
      h('p', JSON.stringify(state.downloads))
    )
  )

  function displayFiles (baseDir) {
    return function (file) {
      const fullPath = getFullPath(baseDir, file.name)
      const isMe = baseDir === '/' && file.mode === 16895
      if (isDir(file.mode)) {
        const downloadState = state.downloads[fullPath]
          ? `Downloaded ${readableBytes(state.downloads[fullPath].totalBytesRead)}`
          : state.wishlist.includes(fullPath)
            ? 'Queued for download'
            : h('button.btn.btn-sm.bit-light',
              { onclick: downloadDir(fullPath),
                title: 'Download' }, icons.use('arrow-down-circle'))

        return h(
          'li',
          h('button.btn.bit-light.btn-sm',
            { onclick: expandDir(file, fullPath) },
            icons.use(baseDir === '/' ? 'person' : 'folder'),
            h('code.text-reset.ml-1', file.name + (isMe ? ' (You)' : ''))
          ),
          downloadState,
          file.expanded
            ? h('ul.list-unstyled.ml-4', state.files[fullPath].sort(dirsFirst).map(displayFiles(fullPath)))
            : ''
        )
      } else {
        return h(
          'li',
          icons.use('file'),
          h('code.text-reset', file.name),
          ' ',
          h('small.mx-2', readableBytes(file.size)),
          h('button', { onclick: showMedia(fullPath) }, 'show media'),
          h('div', { id: 'preview' + cleanPathString(fullPath) })
        )
      }
      function expandDir (dir, path) {
        return function () {
          if (dir.expanded) {
            dir.expanded = false
            emit('render')
          } else {
            dir.expanded = true
            if (state.files[path]) {
              emit('render')
            } else {
              emit('request', { readdir: { path } })
            }
          }
        }
      }
      function downloadDir (path) {
        return function () {
          emit('download', path)
        }
      }
    }
  }

  function getFullPath (baseDir, dirname) {
    const fullPath = path.join(baseDir, dirname)
    return fullPath[0] === '/' ? fullPath.slice(1) : fullPath
  }

  function dirsFirst (fileA, fileB) {
    const aIsDir = isDir(fileA.mode)
    const bIsDir = isDir(fileB.mode)
    if (aIsDir && bIsDir) return 0
    if (aIsDir && !bIsDir) return -1
    if (bIsDir && !aIsDir) return 1
  }

  function showMedia (filepath) {
    return function () {
      renderMedia.append({
        name: filepath,
        createReadStream: function (opts) {
          console.log('createReadStream called', opts)
          const rs = new Readable()
          rs._read = function (n) {
            console.log(' read called', n)
          }
          emit('showMedia', filepath, rs, opts)
          return rs
        }
      }, '#preview' + cleanPathString(filepath), (err, elem) => {
        console.log('Element added', err, elem)
      })
    }
  }

  function cleanPathString (p) {
    // return encodeURIComponent(p).replace(/[!'()]/g, escape).replace(/\./g, '%2A')
    return Buffer.from(p).toString('hex')
  }
}

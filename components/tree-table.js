const h = require('hyperscript')
const path = require('path')
const icons = require('../icons')
const { readableBytes, isDir } = require('../util')
const renderMedia = require('render-media')
const Readable = require('stream').Readable

module.exports = function (state, emit, baseDir = '/', ownSharesOnly) {
  const filter = ownSharesOnly
    ? (file) => file.mode === 16895
    : (file) => file.mode !== 16895

  const filesToDisplay = state.files[baseDir]
    ? state.files[baseDir]
      .filter(filter)
      .sort(dirsFirst)
    : []

  return h('table.table.table-hover.table-sm',
    // h('thead',
    //   h('tr',
    //     h('th', { scope: 'row' }, 'Name'),
    //     h('th', { scope: 'row' }, 'Size')
    //   )
    // ),
    h('tbody',
      filesToDisplay.length
        ? filesToDisplay.map(displayFiles(baseDir, 0))
        : h('p', 'No files to display')
    )
  )

  function displayFiles (baseDir, depth) {
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

        return [
          h('tr', { onclick: expandDir(file, fullPath) },
            h('td',
              h(`span.ml-${depth}`,
                icons.use(baseDir === '/' ? 'person' : 'folder'),
                h('code.text-reset.ml-1', file.name + (isMe ? ' (You)' : '')),
                downloadState
              )
            ),
            h('td', '')
          )].concat(file.expanded
          ? state.files[fullPath].sort(dirsFirst).map(displayFiles(fullPath, depth + 1))
          : [])
      } else {
        return h(
          'tr',
          h('td',
            h(`span.ml-${depth}`,
              icons.use('file'),
              h('code.text-reset', file.name)
            )
          ),
          h('td',
            h('small.mx-2', readableBytes(file.size)),
            h('button', { onclick: showMedia(fullPath) }, 'show media'),
            h('div', { id: 'preview' + cleanPathString(fullPath) })
          )
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

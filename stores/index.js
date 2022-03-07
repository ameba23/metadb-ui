module.exports = function createStores (wsClient) {
  return function (state, emitter) {
    Object.assign(state, {
      files: {},
      cats: {},
      wishlist: [],
      downloads: {}
    })

    wsClient.on('message', (message) => {
      emitter.emit(message.id.toString(), message)
      const success = message.success
      if (success) {
        if (success.readdir) {
          state.files[message.request.readdir.path] = success.readdir.files
          emitter.emit('render')
        }
        if (success.wishlist) {
          state.wishlist = success.wishlist.item
          emitter.emit('render')
        }
      }
    })

    emitter.on('request', (request) => {
      console.log('REQUEST', request)
      wsClient.request(request)
    })

    emitter.on('showMedia', (filepath, readStream, opts) => {
      wsClient.request({ cat: { path: filepath } }).then((id) => {
        emitter.on(id.toString(), (message) => {
          if (message.success) {
            if (message.success.cat) {
              console.log('Pushing to stream')
              readStream.push(Buffer.from(message.success.cat.data))
            } else if (message.success.endResponse) {
              console.log('Closing stream')
              readStream.push(null)
            }
          }
        })
      })
    })

    emitter.on('download', (path) => {
      state.downloads[path] = { bytesRead: 0 }
      wsClient.request({ download: { path } }).then((id) => {
        emitter.on(id.toString(), (message) => {
          if (message.success) {
            if (message.success.download) {
              state.downloads[path] = { bytesRead: message.success.download.bytesRead }
              // TODO optionally also has a 'filePath' property
            } else if (message.success.endResponse) {
              // TODO no longer an active download
            }
          }
        })
      })
    })

    // Begin by reading root dir, and wishlist
    wsClient.request({ readdir: { path: '/' } })
    wsClient.request({ wishlist: {} })
  }
}

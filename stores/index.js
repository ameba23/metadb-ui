
module.exports = function createStores (wsClient) {
  return function (state, emitter) {
    Object.assign(state, {
      files: {},
      cats: {},
      wishlist: [],
      downloads: {},
      swarms: {
        connected: [],
        disconnected: [],
        currentStateUnkown: []
      },
      connectionSettings: {
        host: wsClient.host,
        port: wsClient.port
      }
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
        if (success.swarm) {
          state.swarms = {
            connected: success.swarm.connected,
            disconnected: success.swarm.disconnected,
            currentStateUnkown: []
          }
          emitter.emit('render')
        }
      }
    })

    wsClient.on('error', (err) => {
      state.connectionError = err
      emitter.emit('render')
    })

    wsClient.on('close', (event) => {
      state.connectionError = event
      emitter.emit('render')
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
      wsClient.request({ download: { path } }).then((id) => {
        state.downloads[path] = { requested: true }
        emitter.on(id.toString(), (message) => {
          if (message.success) {
            if (message.success.download) {
              const pathOfDownloadingFile = message.success.download.filePath
                ? message.success.download.filePath
                : path
              state.downloads[pathOfDownloadingFile] = state.downloads[pathOfDownloadingFile] || {}
              state.downloads[pathOfDownloadingFile].bytesRead = message.success.download.bytesRead
            } else if (message.success.endResponse) {
              state.downloads[path].complete = true
            }
            // TODO only render if we are on a page where we display dl progress
            emitter.emit('render')
          }
          // TODO handle errors
        })
      })
    })

    // Begin by reading root dir, and wishlist
    wsClient.request({ readdir: { path: '/' } })
    wsClient.request({ wishlist: {} })
  }
}

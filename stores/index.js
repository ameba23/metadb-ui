const createRequest = require('../request')

module.exports = function createStores (defaultSettings) {
  return function (state, emitter) {
    state.files = []
    state.peers = []
    state.settings = {
      connectedPeers: []
    }
    state.wsEvents = {}

    state.connectionSettings = defaultSettings
    const request = createRequest(state.connectionSettings)

    emitter.on('ws:open', () => {
      console.log('ws: Connection established')
    })

    emitter.on('ws:message', (data, event) => {
      console.log('ws:', data) // temp
      try {
        const message = JSON.parse(data)
        Object.assign(state.wsEvents, message)
        // TODO this means we will be constantly rendering when
        // downloading/uploading. we should only render if we are
        // on the relevant view
        emitter.emit('render')
      } catch (err) {
        if (err) console.log('Error parsing ws message', err) // TODO
      }
    })

    emitter.on('navigate', (d) => {
      console.log('navigate', state.route)
      console.log('params', state.params)
      switch (state.route) {
        case '/':
          emitter.emit('files')
          break
        case 'peers/:peerId':
          request.get(`/files/byPeer/${state.params.peerId}`)
            .then((response) => {
              state.connectionError = false
              state.files = response.data
              emitter.emit('render')
            })
          break
        case 'peers':
          emitter.emit('peers')
          emitter.emit('settings')
          break
        case 'shares':
          emitter.emit('shares')
          break
        case 'transfers':
          emitter.emit('transfers')
          break
        case 'files/:sha256':
          request.get(`/files/${state.params.sha256}`)
            .then((response) => {
              console.log('got res from files:id', JSON.stringify(response.data))
              state.connectionError = false
              state.file = response.data
              emitter.emit('render')
            }).catch(handleError)
          break
      }
    })

    emitter.on('files', () => {
      request.get('/files')
        .then((response) => {
          state.connectionError = false
          state.files = response.data
          emitter.emit('render')
        }).catch(handleError)
    })
    emitter.emit('files')

    emitter.on('peer', () => {
    })

    emitter.on('peers', () => {
      request.get('/peers')
        .then((response) => {
          state.connectionError = false
          state.peers = response.data
          emitter.emit('render')
        }).catch(handleError)
    })
    emitter.emit('peers')

    state.shares = []
    emitter.on('shares', () => {
      request.get('/files/shares')
        .then((response) => {
          state.connectionError = false
          state.files = response.data
          emitter.emit('render')
        }).catch(handleError)
    })

    emitter.on('transfers', (res) => {
      request.get('/request/fromSelf').then((response) => {
        state.connectionError = false
        state.request.fromSelf = response.data
        request.get('/request/fromOthers').then((response) => {
          state.request.fromOthers = response.data
          emitter.emit('render')
        }).catch(handleError)
      })
    })
    emitter.emit('transfers')

    emitter.on('searchResult', (res) => {
      state.files = res.data
      emitter.emit('replaceState', '#search')
    })

    emitter.on('updateConnection', (res) => {
      state.settings.connections = res.data
      emitter.emit('render')
    })

    emitter.on('updateSettings', (res) => {
      state.settings = res.data
      emitter.emit('render')
    })

    emitter.on('subdirResult', (res) => {
      state.files = res.data
      emitter.emit('replaceState', '#subdir')
    })

    state.request = {
      fromSelf: [],
      fromOthers: []
    }

    emitter.on('settings', () => {
      request.get('/settings')
        .then((response) => {
          state.connectionError = false
          state.settings = response.data
          emitter.emit('render')
        }).catch(handleError)
    })
    emitter.emit('settings')

    emitter.on('indexFiles', (res) => {
      state.indexedFiles = res.data
      emitter.emit('render')
    })

    function handleError (error) {
      console.log('error has name', error.message)
      if (error.message === 'Network Error') {
        state.connectionError = true
        emitter.emit('render')
      }
    }
  }
}

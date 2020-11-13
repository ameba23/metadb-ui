const createRequest = require('../request')

module.exports = function createStores (defaultSettings) {
  return function (state, emitter) {
    Object.assign(state, {
      files: [],
      peers: [],
      request: [],
      settings: {
        connectedPeers: []
      },
      wsEvents: {},
      downloads: {},
      shareTotals: [],
      wallMessages: {},
      newWallMessages: {},
      connectionSettings: defaultSettings
    })

    const request = createRequest(state.connectionSettings)

    emitter.on('ws:open', () => {
      console.log('ws: Connection established')
    })

    emitter.on('ws:message', (data, event) => {
      console.log('ws:', data) // temp
      try {
        const message = JSON.parse(data)
        if (message.indexer) {
          state.wsEvents.indexerLog += message.indexer
        }
        if (message.sharedbUpdated) {
          emitter.emit('shares')
        }

        // If we have finished indexing, update totals
        if (message.dbIndexing === false) {
          emitter.emit('settings')
          emitter.emit('navigate') // TODO unsure about this
        }

        if (message.updateWallMessages) {
          // TODO rather than doing more requests, send the new
          // msgs over ws
          emitter.emit('getAllWallMessages')
        }

        if (message.download && message.download.downloadComplete) {
          emitter.emit('transfers')
        }

        if (message.updateTotals) {
          emitter.emit('peers')
          emitter.emit('settings')
        }

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
        case 'connection':
          emitter.emit('getAllWallMessages')
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
      request.get('/files/shares').then((response) => {
        state.connectionError = false
        state.files = response.data
        request.get('/share-totals').then((response) => {
          state.shareTotals = response.data
          emitter.emit('render')
        })
      }).catch(handleError)
    })

    emitter.on('chronological', () => {
      request.get('/files/chronological').then((response) => {
        state.connectionError = false
        state.files = response.data
        emitter.emit('render')
      }).catch(handleError)
    })

    emitter.on('transfers', (res) => {
      request.get('/request').then((response) => {
        state.connectionError = false
        state.request = response.data
        request.get('/downloads').then((response) => {
          state.downloads = response.data
          request.get('/uploads').then((response) => {
            state.uploads = response.data
            emitter.emit('render')
          }).catch(handleError)
        }).catch(handleError)
      }).catch(handleError)
    })
    emitter.emit('transfers')

    emitter.on('searchResult', (res) => {
      state.files = res.data
      emitter.emit('replaceState', '#search')
    })

    emitter.on('updateConnection', (res) => {
      state.settings.swarms = res.data
      emitter.emit('getAllWallMessages')
      emitter.emit('render')
    })

    emitter.on('getAllWallMessages', () => {
      Object.keys(state.settings.swarms)
        .filter(s => state.settings.swarms[s])
        .forEach((swarm) => {
          emitter.emit('getWallMessages', swarm)
        })
    })
    emitter.on('getWallMessages', (swarmKey) => {
      request.post('/wall-message/by-swarm-key', { swarmKey })
        .then((response) => {
          state.wallMessages[swarmKey] = response.data
          emitter.emit('render')
        }).catch(handleError)
    })

    emitter.on('updateSettings', (res) => {
      state.settings = res.data
      state.wsEvents.connectedPeers = state.settings.connectedPeers
      state.updateSuccessful = true
      emitter.emit('render')
    })

    emitter.on('subdirResult', (res) => {
      state.files = res.data
      emitter.emit('replaceState', '#subdir')
    })

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

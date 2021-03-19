const createRequest = require('../request')

module.exports = function createStores (connectionSettings) {
  return function (state, emitter) {
    const request = createRequest(connectionSettings)

    Object.assign(state, {
      files: [],
      peers: [],
      requests: [],
      settings: {
        connectedPeers: [],
        totals: {}
      },
      wsEvents: {},
      downloads: {},
      shareTotals: [],
      wallMessages: {},
      newWallMessages: {},
      connectionSettings,
      request,
      indexerLog: '',
      shares: [],
      uploads: []
    })

    emitter.on('ws:open', () => {
      console.log('ws: Connection established')
    })

    emitter.on('ws:message', (data, event) => {
      console.log('ws:', data) // temp
      try {
        const message = JSON.parse(data)
        if (message.indexer) {
          state.indexerLog += message.indexer + '\n'
          emitter.emit('render')
        }
        if (message.sharedbUpdated && state.route === 'shares') {
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

        if (message.downloaded) {
          emitter.emit('transfers')
        }

        if (message.updateTotals) {
          emitter.emit('peers')
          emitter.emit('settings')
        }

        if (message.swarm) {
          state.settings.swarms[message.swarm.name] = message.swarm.state
          console.log(state.settings.swarms)
        }

        if (message.peer) {
          const i = state.peers.findIndex(peer => peer.feedId === message.peer.feedId)
          if (i > 0) {
            state.peers[i] = message.peer
          } else {
            state.peers.push(message.peer)
          }
          if (!state.settings.connectedPeers.includes(message.peer.feedId)) {
            state.settings.connectedPeers.push(message.peer.feedId)
          }
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
        state.requests = response.data
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

    // emitter.on('updateConnection', (res) => {
    //   state.settings.swarms = res.data
    //   emitter.emit('getAllWallMessages')
    //   emitter.emit('render')
    // })

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

    emitter.on('requestDirectory', (subdir) => {
      state.request.post('/files/subdir', { subdir })
        .then((res) => {
          const files = res.data.map(f => f.sha256)
          state.request.post('/request', { files })
            .then((res) => {
              emitter.emit('transfers', res) // TODO: dont acutally need to pass res
            })
            .catch(handleError) // TODO
        }).catch(handleError)
    })

    emitter.on('subdirQuery', (subdirs) => {
      console.log('subdirQuery', subdirs)
      state.subdirQuery = Array.isArray(subdirs) ? subdirs.join('/') : subdirs
      request.post('/files/subdir', { subdir: state.subdirQuery, opts: { oneLevel: true } })
        .then((res) => {
          state.files = res.data
          emitter.emit('replaceState', '#subdir')
        })
        .catch(console.log)
    })

    emitter.on('addPeer', (peerId) => {
      request.post('/peers', { peerId })
        // .then((res) => {
        //   emit('', res)
        // })
        .catch(() => {
          state.addPeerError = true
        })
    })

    function handleError (error) {
      console.log('Error from store', error.message)
      if (error.message === 'Network Error') {
        state.connectionError = true
        emitter.emit('render')
      }
    }
  }
}

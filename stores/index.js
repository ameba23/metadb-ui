const request = require('../request')

module.exports = function (state, emitter) {
  state.files = []
  state.peers = []

  emitter.on('navigate', (d) => {
    console.log('navigate', state.route)
    console.log('params', state.params)
    switch (state.route) {
      case '/':
        emitter.emit('files')
        break
      case 'peers':
        emitter.emit('peers')
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
            state.file = response.data
            emitter.emit('render')
          })
        break
    }
  })

  emitter.on('files', () => {
    request.get('/files')
      .then((response) => {
        state.files = response.data
        emitter.emit('render')
      })
  })
  emitter.emit('files')

  emitter.on('peers', () => {
    request.get('/peers')
      .then((response) => {
        state.peers = response.data
        emitter.emit('render')
      })
  })
  emitter.emit('peers')

  state.shares = []
  emitter.on('shares', () => {
    request.get('/files/shares')
      .then((response) => {
        state.files = response.data
        emitter.emit('render')
      })
  })

  emitter.on('transfers', (res) => {
    request.get('/request/fromSelf').then((response) => {
      state.request.fromSelf = response.data
      request.get('/request/fromOthers').then((response) => {
        state.request.fromOthers = response.data
        emitter.emit('render')
      })
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

  request.get('/settings')
    .then((response) => {
      state.settings = response.data
      // state.settings.events.files.on('update', () => { emitter.emit('updateFiles') })
      // state.settings.events.peers.on('update', () => { emitter.emit('updatePeers') })
      // state.settings.events.requests.on('update', () => { emitter.emit('updateRequests') })
      emitter.emit('render')
    })
}

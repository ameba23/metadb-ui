const request = require('../request')

module.exports = function (state, emitter) {
  state.files = []
  emitter.on('updateFiles', () => {
    request.get('/files')
      .then((response) => {
        state.files = response.data
        emitter.emit('render')
      })
  })
  emitter.emit('updateFiles')

  emitter.on('navigate', (d) => {
    console.log('navigate', state.route)
    console.log('params', state.params)
    switch (state.route) {
      case '/':
        emitter.emit('updateFiles')
        break
      case 'peers':
        emitter.emit('updatePeers')
        break
      case 'ownFiles':
        emitter.emit('shares')
        break
      case 'transfers':
        emitter.emit('updateRequests')
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

  request.get('/settings')
    .then((response) => {
      state.settings = response.data
      // state.settings.events.files.on('update', () => { emitter.emit('updateFiles') })
      // state.settings.events.peers.on('update', () => { emitter.emit('updatePeers') })
      // state.settings.events.requests.on('update', () => { emitter.emit('updateRequests') })
      emitter.emit('render')
    })

  state.peers = []
  emitter.on('updatePeers', () => {
    request.get('/peers')
      .then((response) => {
        state.peers = response.data
        emitter.emit('render')
      })
  })
  emitter.emit('updatePeers')

  state.ownFiles = []
  emitter.on('shares', () => {
    request.get('/files/ownfiles')
      .then((response) => {
        state.ownFiles = response.data
        emitter.emit('render')
      })
  })
  emitter.emit('shares')

  emitter.on('searchResult', (res) => {
    state.searchResult = res.data
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
    state.subdir = res.data
    emitter.emit('replaceState', '#subdir')
  })

  state.request = {
    fromSelf: [],
    fromOthers: []
  }
  emitter.on('updateRequests', (res) => {
    request.get('/request/fromSelf').then((response) => {
      state.request.fromSelf = response.data
      request.get('/request/fromOthers').then((response) => {
        state.request.fromOthers = response.data
        emitter.emit('render')
      })
    })
  })
  emitter.emit('updateRequests')
}

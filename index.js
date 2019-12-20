var css = require('sheetify')
var choo = require('choo')
const request = require('./request')

css('tachyons')

var app = choo()

app.use(function (state, emitter) {
  state.files = []
  request.get('/files')
    .then((response) => {
      state.files = response.data
      emitter.emit('render')
    })
})

app.use(function (state, emitter) {
  state.files = []
  request.get('/settings')
    .then((response) => {
      state.settings = response.data
      emitter.emit('render')
    })
})

app.use(function (state, emitter) {
  state.peers = []
  request.get('/peers')
    .then((response) => {
      state.peers = response.data
      emitter.emit('render')
    })
})

app.use(function (state, emitter) {
  state.myFiles = []
  request.get('/files/ownfiles')
    .then((response) => {
      state.ownFiles = response.data
      emitter.emit('render')
    })
})

app.use((state, emitter) => {
  emitter.on('searchResult', (res) => {
    state.searchResult = res.data
    emitter.emit('replaceState', '#search')
  })
})

app.use((state, emitter) => {
  emitter.on('updateConnection', (res) => {
    state.settings.connections = res.data
    emitter.emit('render')
  })
})

app.use((state, emitter) => {
  emitter.on('updateSettings', (res) => {
    state.settings = res.data
    emitter.emit('render')
  })
})

app.use((state, emitter) => {
  emitter.on('subdirResult', (res) => {
    state.subdir = res.data
    emitter.emit('replaceState', '#subdir')
  })
})
app.route('/*', require('./views/404'))
app.route('/', require('./views/files'))
app.route('#files', require('./views/files'))
app.route('#ownfiles', require('./views/own-files'))
app.route('#files/:sha256', require('./views/file'))
app.route('#peers', require('./views/peers'))
app.route('#peers/:peerId', require('./views/peer'))
app.route('#search', require('./views/search'))
app.route('#settings', require('./views/settings'))
app.route('#connection', require('./views/connection'))
app.route('#subdir', require('./views/subdir'))

module.exports = app.mount('body')

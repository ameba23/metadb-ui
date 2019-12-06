var css = require('sheetify')
var choo = require('choo')
const request = require('./request')

css('tachyons')

var app = choo()
if (process.env.NODE_ENV !== 'production') {
  app.use(require('choo-devtools')())
} else {
  app.use(require('choo-service-worker')())
}

app.use(function (state, emitter) {
  state.files = []
  request.get('/files')
    .then((response) => {
      state.files = response.data
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

app.use((state, emitter) => {
  state.searchterm = ''
})

app.route('/*', require('./views/404'))
app.route('/', require('./views/files'))
app.route('/files', require('./views/files'))
app.route('/files/:sha256', require('./views/file'))
app.route('/peers', require('./views/peers'))
app.route('/peers/:peerId', require('./views/peer'))
app.route('/search/:searchterm', require('./views/search'))

module.exports = app.mount('body')

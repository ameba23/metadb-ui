const css = require('sheetify')
const choo = require('choo')
const WsClient = require('./lib/ws-client')

css('bootstrap')

const app = choo()

const defaultSettings = {
  host: `http${process.env.https ? 's' : ''}://${process.env.host || 'localhost'}`,
  port: process.env.port || 2323
}

const wsClient = new WsClient(defaultSettings.host.split('//')[1], defaultSettings.port)

app.use(require('./stores')(wsClient))
// app.use(require('choo-websocket')(wsroute))

app.route('/*', require('./views/404'))
app.route('/', require('./views/files'))
app.route('#files', require('./views/files'))
// app.route('#shares', require('./views/shares'))
// app.route('#files/:sha256', require('./views/file'))
// app.route('#peers', require('./views/peers'))
// app.route('#peers/:peerId', require('./views/peer'))
// app.route('#search', require('./views/search'))
// app.route('#settings', require('./views/settings'))
// app.route('#connection', require('./views/connection'))
// app.route('#subdir', require('./views/subdir'))
// app.route('#transfers', require('./views/transfers'))

module.exports = app.mount('body')

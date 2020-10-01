var css = require('sheetify')
var choo = require('choo')

css('tachyons')

var app = choo()

const defaultSettings = {
  host: `http${process.env.https ? 's' : ''}://${process.env.host || 'localhost'}`,
  port: process.env.port || 2323
}

// TODO this would need to be updated when defaultsettings are updated
const wsroute = defaultSettings.host.split('//')[1] + ':' + defaultSettings.port
console.log(wsroute)

app.use(require('./stores')(defaultSettings))
app.use(require('choo-websocket')(wsroute))

app.route('/*', require('./views/404'))
app.route('/', require('./views/files'))
app.route('#files', require('./views/files'))
app.route('#shares', require('./views/shares'))
app.route('#files/:sha256', require('./views/file'))
app.route('#peers', require('./views/peers'))
app.route('#peers/:peerId', require('./views/peer'))
app.route('#search', require('./views/search'))
app.route('#settings', require('./views/settings'))
app.route('#connection', require('./views/connection'))
app.route('#subdir', require('./views/subdir'))
app.route('#transfers', require('./views/transfers'))

module.exports = app.mount('body')

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

app.route('/', require('./views/main'))
app.route('/file/:hash', require('./views/file'))
app.route('/*', require('./views/404'))

module.exports = app.mount('body')

var html = require('choo/html')
const basic = require('./basic')

var TITLE = 'metadb - route not found'

module.exports = view

function view (state, emit) {
  if (state.title !== TITLE) emit(state.events.DOMTITLECHANGE, TITLE)
  return basic(html`
    <h1>Route not found.</h1>
    <a href="/">Back to main.</a>
  `)
}

const html = require('choo/html')
const TITLE = 'metadb - transfers'
const basic = require('./basic')

module.exports = view

function displayRequest (request) {
  return html`<li>${JSON.stringify(request)}</li>`
}

function view (state, emit) {
  if (state.title !== TITLE) emit(state.events.DOMTITLECHANGE, TITLE)

  return basic(state, emit, html`
    <h3>Requests sent:</h3>
    <ul>${state.request.fromSelf.map(displayRequest)}</ul>
    <h3>Requests received:</h3>
    <ul>${state.request.fromOthers.map(displayRequest)}</ul>
    `)
}

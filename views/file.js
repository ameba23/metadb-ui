const html = require('choo/html')
const TITLE = 'metadb'
const { readableBytes } = require('../util')

const basic = require('./basic')
module.exports = view

var depth = 0

function displayKey (key) {
  if (key) { return html`<li><b>${key}:</b></li>` }
}

function displayPeer (peer) {
  return html`<li><a href="/peers/${peer}">${peer}</a></li>`
}

function item (key, value) {
  if (key === 'holders' && depth === 0) {
    return html`
      <ul>${value.map(displayPeer)}</ul>
      `
  }

  if (typeof value === 'object') {
    // depth += 1
    return html`
      ${displayKey(key)}
      <ul>${Object.keys(value).map(k => item(k, value[k]))}</ul>
      `
  }

  if (key === 'timestamp' && typeof value === 'number') {
    key = 'Added'
    value = Date(value)
  }

  if (key === 'size' && typeof value === 'number') {
    value = readableBytes(value)
  }

  return html`<li><b>${key}:</b> ${value}</li>`
}

function view (state, emit) {
  if (state.title !== TITLE) emit(state.events.DOMTITLECHANGE, TITLE)
  const file = state.files.find(file => file.sha256 === state.params.sha256)

  if (file) {
    return basic(html`
      <h3>${file.filename}</h3>
      ${item(null, file)}
    `, state, emit)
  } else {
    return basic(html`<p>File not found</p>`)
  }
}

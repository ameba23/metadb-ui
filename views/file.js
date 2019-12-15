const html = require('choo/html')
const TITLE = 'metadb'
const { readableBytes } = require('../util')
const request = require('../request')
const { formData } = require('../util')

const basic = require('./basic')
module.exports = view

var depth = 0

function view (state, emit) {
  if (state.title !== TITLE) emit(state.events.DOMTITLECHANGE, TITLE)
  const file = state.files.find(file => file.sha256 === state.params.sha256)
  if (file) {
    return basic(state, emit, html`
      <h3>${file.filename}</h3>
      <button type="button" onclick="${requestFile}">Request file</button>
      ${item(null, file)}
      <form id="comment" onsubmit=${onSubmit}>
        <input type=text id="comment" value="" name="comment">
        <input type=submit value="add comment">
      </form>
      <button>star</button>
    `)
  } else {
    return basic(html`<p>File not found</p>`)
  }

  function onSubmit (e) {
    e.preventDefault()
    var form = e.currentTarget
    var thing = formData(form)
    // body.get('searchterm')
    request.post(`/files/${file.sha256}`, thing)
      .then((res) => {
        emit('updateComments', res)
      })
      .catch(console.log)
  }

  function requestFile () {
    request.post('/request', { data: { files: [file.sha256] } })
      .then((res) => {
        emit('updateRequests', res)
      })
      .catch(console.log) // TODO
  }

  function displayKey (key) {
    if (key) { return html`<li><b>${key}:</b></li>` }
  }

  function displayPeer (peer) {
    const peerName = state.settings.peerNames
      ? state.settings.peerNames[peer] || peer
      : peer
    return html`<li><a href="#peers/${peer}">${peerName}</a></li>`
  }

  function item (key, value) {
    if (key === 'holders' && depth === 0) {
      return html`
        <li><b>Held by:</b>
        <ul>${value.map(displayPeer)}</ul>
        </li>
        `
    }

    if (value === [] || value === {} || !value) value = ''
    if (Array.isArray(value)) value = JSON.stringify(value) // TODO this could be improved
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
}

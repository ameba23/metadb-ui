const html = require('choo/html')
const TITLE = 'metadb'
const { readableBytes } = require('../util')

const basic = require('./basic')
module.exports = view
module.exports.filesView = filesView

function tableLine (file) {
  return html`
    <tr>
      <td>${file.filename.split('/').map(subdir)}</td>
      <td>${file.metadata.mimeType}</td>
      <td>${readableBytes(file.size)}</td>
    </tr>
  `
  function subdir (portion) {
    // TODO subdir links should take you to that part of the dir structure
    // TODO the last one need to be treated differeently
    return html`<a href="#files/${file.sha256}">${portion}</a> / `
  }
}

function view (state, emit) {
  if (state.title !== TITLE) emit(state.events.DOMTITLECHANGE, TITLE)
  return basic(state, emit, filesView(state, emit, 'files'))
}

function filesView (state, emit, files) {
  return html`
    <table>
    <tr>
      <th>filename</th>
      <th>mime type</th>
      <th>size</th>
    </tr>
    ${state[files].map(tableLine)}
    </table>
  `
}

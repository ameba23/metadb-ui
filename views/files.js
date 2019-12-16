const html = require('choo/html')
const TITLE = 'metadb'
const { readableBytes } = require('../util')
const path = require('path')

const basic = require('./basic')
module.exports = view
module.exports.filesView = filesView

function tableLine (file) {
  return html`
    <tr>
      <td>${path.dirname(file.filename).split('/').map(subdir)}
          <a href="#files/${file.sha256}">${path.basename(file.filename)}</a></td>
      <td>${file.metadata.mimeType}</td>
      <td>${readableBytes(file.size)}</td>
    </tr>
  `
  function subdir (portion, i, filePath) {
    const subdir = filePath.slice(0, i)
    // TODO subdir links should take you to that part of the dir structure
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

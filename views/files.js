const html = require('choo/html')
const TITLE = 'metadb'

const basic = require('./basic')
module.exports = view
module.exports.filesView = filesView

function tableLine (file) {
  return html`
    <tr>
      <td><a href="/files/${file.sha256}">${file.filename}</a></td>
      <td>${file.metadata.mimeType}</td>
    </tr>
  `
}

function view (state, emit) {
  return filesView(state, emit, 'files')
}

function filesView (state, emit, files) {
  if (state.title !== TITLE) emit(state.events.DOMTITLECHANGE, TITLE)

  return basic(html`
    <table>
    <tr>
      <th>filename</th>
      <th>mime type</th>
    </tr>
    ${state[files].map(tableLine)}
    </table>
  `, state, emit)
}

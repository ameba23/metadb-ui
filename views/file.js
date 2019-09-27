const html = require('choo/html')
const TITLE = 'metadb - file'

module.exports = view

function basic (content) {
  return html`
    <body>
      <h2>metadb</h2>
      ${content}
    </body>
  `
}

function view (state, emit) {
  if (state.title !== TITLE) emit(state.events.DOMTITLECHANGE, TITLE)

  const file = state.files.find(f => f.hash === state.params.hash)

  if (file) {
    return basic(html`
      <p>
      ${file.data.filename}
      </p>
    `)
  } else {
    return basic(html`
      <p>
      file ${state.params.hash} not found
      </p>
    `)
  }
}

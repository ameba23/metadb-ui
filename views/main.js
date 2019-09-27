const html = require('choo/html')
const TITLE = 'firstchoo - main'

const tableLine = require('./table-line')
module.exports = view

function view (state, emit) {
  if (state.title !== TITLE) emit(state.events.DOMTITLECHANGE, TITLE)

  return html`
    <body>
      <h2>metadb</h2>
        <p>
        files
        </p>
        <table>
        <tr>
          <th>filename</th>
          <th>mime type</th>
        </tr>
        ${state.files.map(tableLine)}
        </table>
    </body>
  `

  function handleClick () {
    emit('clicks:add', 1)
  }
}

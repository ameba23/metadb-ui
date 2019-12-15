const basic = require('./basic')
const html = require('choo/html')
const { filesView } = require('./files')

module.exports = view
// state.settings.shares
function view (state, emit) {
  return basic(state, emit, html`
    <h3>shares</h3>
    <p>${JSON.stringify(state.settings.shares)}</p>
    <form id="indexDir" onsubmit="${onSubmit}">
       <input type="file" id="dir">
       <input type=submit value="submit">
    </form>
    ${filesView(state, emit, 'files')}
    `
  )
  function onSubmit () {
    return null
  }
}

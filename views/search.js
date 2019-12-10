const { filesView } = require('./files')

module.exports = view
function view (state, emit) {
  return filesView(state, emit, 'searchResult')
}
// const html = require('choo/html')
// const basic = require('./basic')


// function view (state, emit) {
//     return basic(html`
//       <h3>${JSON.stringify(state.searchResult)}</h3>
//     `)
// }

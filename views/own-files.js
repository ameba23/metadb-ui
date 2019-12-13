const basic = require('./basic')
const html = require('choo/html')
const { filesView } = require('./files')

module.exports = view
// state.settings.shares
function view (state, emit) {
  return filesView(state, emit, 'files')
  // return filesView(state, emit, 'ownFiles')
}

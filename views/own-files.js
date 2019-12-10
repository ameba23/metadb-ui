const { filesView } = require('./files')

module.exports = view

function view (state, emit) {
  return filesView(state, emit, 'files')
  // return filesView(state, emit, 'ownFiles')
}

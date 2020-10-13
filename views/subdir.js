const { filesView } = require('./files')
const basic = require('./basic')

module.exports = view

function view (state, emit) {
  return basic(state, emit, filesView(state, emit, 'files', { subdirQuery: state.subdirQuery }))
}

const h = require('hyperscript')
const TITLE = 'harddrive-party - files'
const basic = require('./basic')
const treeTable = require('../components/tree-table')

module.exports = view

function view (state, emit) {
  if (state.title !== TITLE) emit(state.events.DOMTITLECHANGE, TITLE)

  return basic(state, emit,
    h('div',
      treeTable(state, emit, '/'),
      h('h2', 'Wishlist:'),
      h('p', JSON.stringify(state.wishlist)),
      h('h2', 'Downloads:'),
      h('p', JSON.stringify(state.downloads))
    )
  )
}

const h = require('hyperscript')
const basic = require('./basic')

const TITLE = 'metadb - route not found'

module.exports = view

function view (state, emit) {
  if (state.title !== TITLE) emit(state.events.DOMTITLECHANGE, TITLE)
  return basic(state, emit,
    h('div',
      h('h1', 'Route not found.'),
      h('a', { href: '/' }, 'Back to main')
    )
  )
}

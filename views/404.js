const h = require('hyperscript')
const basic = require('./basic')

const TITLE = 'harddrive-party - route not found'

module.exports = view

function view (state, emit) {
  if (state.title !== TITLE) emit(state.events.DOMTITLECHANGE, TITLE)
  return basic(state, emit,
    h('body',
      h('h1', 'Route not found.'),
      h('a', { href: '/' }, 'Back to main')
    )
  )
}

const html = require('choo/html')
const TITLE = 'metadb - search result'
const basic = require('./basic')

module.exports = view

function view (state, emit) {
  if (state.title !== TITLE) emit(state.events.DOMTITLECHANGE, TITLE)

  return basic(html`<p>${JSON.stringify(state.searchResult)}</o>`)
}

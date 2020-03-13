const createRequest = require('../request')
const h = require('hyperscript')
const { formData } = require('../util')

module.exports = function (state, emit, content) {
  const request = createRequest(state.connectionSettings)
  return h('body',
    h('h3',
      h('form', { id: 'search', onsubmit: onSubmit },
        h('strong', 'metadb'), ' - ',
        h('a', { href: '#connection' }, 'connection'), ' - ',
        h('a', { href: '#' }, 'files'), ' - ',
        h('a', { href: '#shares' }, 'shares'), ' - ',
        h('a', { href: '#peers' }, 'peers'), ' - ',
        h('a', { href: '#settings' }, 'settings'), ' - ',
        h('a', { href: '#transfers' }, 'transfers'), ' - ',
        h('input', { type: 'text', id: 'searchterm', value: '', name: 'searchterm' }),
        h('input', { type: 'submit', value: 'search' })
      )),
    h('hr'),
    content)

  function onSubmit (e) {
    e.preventDefault()
    var form = e.currentTarget
    var thing = formData(form)
    // TODO this request should be in the store
    request.post('/files/search', thing)
      .then((res) => {
        emit('searchResult', res)
      })
      .catch(console.log)
  }
}

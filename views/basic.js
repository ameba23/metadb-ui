const html = require('choo/html')
const request = require('../request')
const h = require('hyperscript')

module.exports = function (state, emit, content) {
  // state.searchterm = ''
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
  // return html`
  //   <body>
  //     <h3>
  //       <form id="search" onsubmit=${onSubmit}>
  //         <strong>metadb</strong> - <a href="#connection">connection</a> - <a href="#">files</a> -
  //         <a href="#shares">shares</a> - <a href="#peers">peers</a> - <a href="#settings">settings</a> - <a href="#transfers">transfers</a> -
  //         <input type=text id="searchterm" value="" name="searchterm">
  //         <input type=submit value="search">
  //       </form>
  //     </h3>
  //     <hr>
  //     ${content}
  //   </body>
  // `

  function onSubmit (e) {
    e.preventDefault()
    var form = e.currentTarget
    var thing = formData(form)
    // body.get('searchterm')
    request.post('/files/search', thing)
      .then((res) => {
        emit('searchResult', res)
      })
      .catch(console.log)
  }
}
function formData (form) {
  const data = {}
  new FormData(form).forEach((v, k) => {
    data[k] = v
  })
  return data
}

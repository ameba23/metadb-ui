const html = require('choo/html')
const request = require('../request')

module.exports = function (state, emit, content) {
  // state.searchterm = ''
  return html`
    <body>
      <h2>metadb</h2>
      <h3>
        <form id="search" onsubmit=${onSubmit}>
          <a href="#connection">connection</a> - <a href="#">files</a> - <a href="#ownfiles">shares</a> - <a href="#peers">peers</a> - <a href="#settings">settings</a> -
          <input type=text id="searchterm" value="" name="searchterm">
          <input type=submit value="search">
        </form>
      </h3>
      ${content}
    </body>
  `

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

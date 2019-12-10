const html = require('choo/html')
const request = require('../request')

module.exports = function (content, state, emit) {
  // state.searchterm = ''
  return html`
    <body>
      <h2>metadb</h2>
      <h3>
        <form id="search" onsubmit=${onSubmit}>
          <a href="/">files</a> - <a href="/ownfiles">own files</a> - <a href="/peers">peers</a> - settings -
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
    console.log(JSON.stringify(thing))
    // body.get('searchterm')
    request.get('/search', thing)
      .then((res) => {
        emit('seachResult', res)
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

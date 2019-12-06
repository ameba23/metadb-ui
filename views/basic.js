const html = require('choo/html')

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
}

function onSubmit (e) {
  // e.preventDefault()
  var form = e.currentTarget
  var body = new FormData(form)
  // body.get('searchterm')
  // fetch('/seach', { method: 'POST', body })
}

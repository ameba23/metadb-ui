const html = require('choo/html')

module.exports = function (content) {
  return html`
    <body>
      <h2>metadb</h2>
      <h3><a href="/">files</a> - <a href="/peers">peers</a> - settings</h3>
      <form id="search" onsubmit=${onSubmit}>
        <input type=text id="searchterm" name="searchterm">
        <input type=submit value="search">
      </form>
      ${content}
    </body>
  `
}

function onSubmit (e) {
  e.preventDefault()
  const body = new FormData(e.currentTarget)
  fetch('/seach', { method: 'POST', body })
}

const html = require('choo/html')

module.exports = function (content, state, emit) {
  state.searchterm = ''
  return html`
    <body>
      <h2>metadb</h2>
      <h3><a href="/">files</a> - <a href="/peers">peers</a> - settings</h3>
        <input type=text id="searchterm" value=${state.searchterm} name="searchterm">
        <input type=submit value="search">
        ${state.searchterm}
      ${content}
    </body>
  `
}

// function onSubmit (e) {
//   e.preventDefault()
//   const body = new FormData(e.currentTarget)
//   fetch('/seach', { method: 'POST', body })
// }

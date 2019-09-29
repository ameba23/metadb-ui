const html = require('choo/html')

module.exports = function (content) {
  return html`
    <body>
      <h2>metadb</h2>
      <h3><a href="/">files</a> - <a href="/peers">peers</a> - search - settings</h3>
      ${content}
    </body>
  `
}

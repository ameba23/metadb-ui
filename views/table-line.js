var html = require('choo/html')

module.exports = function (file) {
  return html`
    <tr>
      <td>${file.data.filename}</td>
      <td>${file.data.metadata.mimeType}</td>
    </tr>
  `
}

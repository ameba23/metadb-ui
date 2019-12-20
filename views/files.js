const html = require('choo/html')
const TITLE = 'metadb'
const { readableBytes } = require('../util')
const path = require('path')
const request = require('../request')

const basic = require('./basic')
module.exports = view
module.exports.filesView = filesView

function view (state, emit) {
  if (state.title !== TITLE) emit(state.events.DOMTITLECHANGE, TITLE)
  return basic(state, emit, filesView(state, emit, 'files'))
}

function filesView (state, emit, files) {
  function tableLine (file) {
    return html`
    <tr>
      <td>
          <input type="checkbox" name="files" value="${file.sha256}">
          ${path.dirname(file.filename).split('/').map(subdir)}
          <a href="#files/${file.sha256}">${path.basename(file.filename)}</a></td>
      <td>${file.metadata.mimeType}</td>
      <td>${readableBytes(file.size)}</td>
    </tr>
  `
    function subdir (portion, i, filePath) {
      function subdirQuery (a) {
        return () => {
          state.subdirQuery = a.join('/')
          request.post('/files/subdir', { subdir: state.subdirQuery })
            .then((res) => {
              emit('subdirResult', res)
            })
            .catch(console.log)
        }
      }
      return html`<a href="javascript:void(null)" onclick=${subdirQuery(filePath.slice(0, i + 1))}>${portion}</a> / `
    }
  }
  return html`
    <form id="selectFiles" onsubmit="${requestFiles}">
    <table>
      <tr>
        <th>filename</th>
        <th>mime type</th>
        <th>size</th>
      </tr>
      ${state[files].map(tableLine)}
    </table>
    <input type=submit value="request files">
    </form>
  `
  function requestFiles () {}
  //   Select <a href="javascript:selectToggle(true, 'selectFiles');">All</a> | <a href="javascript:selectToggle(false, 'selectFiles');">None</a><p>
  // function selectToggle(toggle, form) {
  //   var myForm = document.forms[form];
  //   for( var i=0; i < myForm.length; i++ ) { 
  //     if(toggle) {
  //       myForm.elements[i].checked = "checked";
  //     } 
  //     else {
  //       myForm.elements[i].checked = "";
  //     }
  //   }
  // }
}

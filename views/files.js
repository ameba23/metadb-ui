const html = require('choo/html')
const h = require('hyperscript')
const TITLE = 'metadb'
const { readableBytes } = require('../util')
const path = require('path')
const createRequest = require('../request')
const { formData } = require('../util')

const basic = require('./basic')
module.exports = view
module.exports.filesView = filesView

const noFiles = h('p', 'You currently have no files in the database.  To add some, either ',
  h('a', { href: '#connection' }, 'connect to a swarm'), ' or ', h('a', { href: '#shares' }, 'add some files'), ' yourself.')

function view (state, emit) {
  if (state.title !== TITLE) emit(state.events.DOMTITLECHANGE, TITLE)
  return basic(state, emit, filesView(state, emit, 'files', noFiles))
}

function filesView (state, emit, files, noFilesMessage) {
  const request = createRequest(state.connectionSettings)
  if (state.connectionError && !state[files].length) {
    // TODO display expected host and port number and give an option to change it
    return h('h3', 'Error when trying to connect to the API. Is the metadb API running?')
  }

  noFilesMessage = noFilesMessage || h('p', 'No files to display')

  function tableLine (file) {
    return html`
    <tr>
      <td>
          <input type="checkbox" id="${file.sha256}" name="${file.sha256}" value="true">
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
  return h('form', { id: 'selectFiles', onsubmit: requestFiles },
    h('table',
      h('tr',
        h('th', 'Filename'),
        h('th', 'MIME type'),
        h('th', 'Size')
      ),
      state[files].map(tableLine)
    ),
    state[files].length
      ? h('input', { type: 'submit', value: 'Request files' })
      : noFilesMessage
  )

  // return html`
  //   <form id="selectFiles" onsubmit="${requestFiles}">
  //   <table>
  //     <tr>
  //       <th>filename</th>
  //       <th>mime type</th>
  //       <th>size</th>
  //     </tr>
  //     ${state[files].map(tableLine)}
  //   </table>
  //   <input type=submit value="request files">
  //   </form>
  // `

  function requestFiles (e) {
    e.preventDefault()
    var form = e.currentTarget
    var thing = formData(form)
    request.post('/request', { files: Object.keys(thing) })
      .then((res) => {
        emit('transfers', res) // TODO: dont acutally need to pass res
      })
      .catch(console.log) // TODO
  }

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

const html = require('choo/html')
const h = require('hyperscript')
const TITLE = 'metadb'
const path = require('path')
const createRequest = require('../request')
const { formData, readableBytes } = require('../util')

const basic = require('./basic')
module.exports = view
module.exports.filesView = filesView

const noFiles = h('p', 'You currently have no files in the database.  To add some, either ',
  h('a', { href: '#connection' }, 'connect to a swarm'), ' or ', h('a', { href: '#shares' }, 'add some files'), ' yourself.')

function view (state, emit) {
  if (state.title !== TITLE) emit(state.events.DOMTITLECHANGE, TITLE)
  return basic(state, emit, filesView(state, emit, 'files', noFiles))
}

function filesView (state, emit, files, noFilesMessage, options = {}) {
  const request = createRequest(state.connectionSettings)
  noFilesMessage = noFilesMessage || h('p', 'No files to display')

  function tableLine (file) {
    if (file.dir) {
      // TODO could also have a checkbox to download the directory
      return h('tr',
        h('td', h('strong', h('a', {
          href: 'javascript:void(null)',
          onclick: subdirQuery(file.fullPath)
        }, icon(), file.dir)))
      )
    }

    const filenames = Array.isArray(file.filename) ? file.filename : [file.filename]
    // TODO this does not appear to handle multiple filename arrays correctly
    return html`
    <tr>
      <td>
          <input type="checkbox" id="${file.sha256}" name="${file.sha256}" value="true">
          ${filenames.map(filename => path.dirname(filename).split('/').map(subdir))}
          <a href="#files/${file.sha256}">${path.basename(file.filename)}</a></td>
      <td>${file.metadata.mimeType}</td>
      <td>${readableBytes(file.size)}</td>
    </tr>
  `
  }

  function subdir (portion, i, filePath) {
    if (portion === '.') return h('span')

    return h('span', h('a', {
      href: 'javascript:void(null)',
      onclick: subdirQuery(filePath.slice(0, i + 1))
    }, portion), ' / ')
  }

  return h('form', { id: 'selectFiles', onsubmit: requestFiles },
    options.subdirQuery
      ? h('h2',
        h('a', { href: 'javascript:void(null)', onclick: subdirQuery('') }, ' / '),
        options.subdirQuery.split('/').map(subdir)
      )
      : h('span'),
    h('table.striped--moon-gray:nth-child',
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

  function subdirQuery (a) {
    return () => {
      state.subdirQuery = Array.isArray(a) ? a.join('/') : a
      request.post('/files/subdir', { subdir: state.subdirQuery, opts: { oneLevel: true } })
        .then((res) => {
          emit('subdirResult', res)
        })
        .catch(console.log)
    }
  }

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
function icon () {
  return html`
<svg xmlns="http://www.w3.org/2000/svg" width="20" hieght="20" viewBox="0 0 512 512"><path d="M464 128H272l-54.63-54.63c-6-6-14.14-9.37-22.63-9.37H48C21.49 64 0 85.49 0 112v288c0 26.51 21.49 48 48 48h416c26.51 0 48-21.49 48-48V176c0-26.51-21.49-48-48-48zm0 272H48V112h140.12l54.63 54.63c6 6 14.14 9.37 22.63 9.37H464v224z"/></svg>
  `
}

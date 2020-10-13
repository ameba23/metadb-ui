const h = require('hyperscript')
const createRequest = require('../request')
const basic = require('./basic')
module.exports = view

function view (state, emit) {
  const request = createRequest(state.connectionSettings)
  const success = state.updateSuccessful
  state.updateSuccessful = false
  state.setName = state.settings.peerNames[state.settings.key]
  state.setDownloadPath = state.settings.downloadPath
  return basic(state, emit,
    h('div',
      h('h3', 'Settings'),
      h('p', `Host: ${state.connectionSettings.host} Port: ${state.connectionSettings.port.toString()}`),
      h('form', { id: 'addname', onsubmit: onSubmit },
        h('p',
          h('label', { for: 'name' }, 'Name:'),
          h('input', { type: 'text', id: 'name', value: state.setName, name: 'name', oninput: updateName })
        ),
        h('p',
          h('label', { for: 'downloadPath' }, 'Download path:'),
          h('input', { type: 'text', id: 'downloadPath', value: state.setDownloadPath, name: 'downloadPath', size: 60, oninput: updateDownloadPath })
        ),
        h('input', { type: 'submit', value: 'Update settings' }),
        h('span', success ? 'Update successful' : '')
      )
    )
  )

  function updateName (event) {
    state.setName = event.target.value
  }

  function updateDownloadPath (event) {
    state.setDownloadPath = event.target.value
  }

  function onSubmit (e) {
    e.preventDefault()
    request.post('/settings', { name: state.setName, downloadPath: state.setDownloadPath })
      .then((res) => {
        emit('updateSettings', res)
      })
      .catch(console.log) // TODO
  }
}

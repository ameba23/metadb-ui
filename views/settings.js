const h = require('hyperscript')
const createRequest = require('../request')
const basic = require('./basic')
module.exports = view

function view (state, emit) {
  const request = createRequest(state.connectionSettings)
  const success = state.updateSuccessful
  state.updateSuccessful = false
  state.setName = state.settings.peerNames
    ? state.settings.peerNames[state.settings.key]
    : ''
  state.setDownloadPath = state.settings.downloadPath
  const httpBasicAuth = state.connectionSettings.basicAuthUser && state.connectionSettings.basicAuthPassword

  return basic(state, emit,
    h('div',
      h('h3', 'Settings'),
      h('div',
        h('strong', 'Host: '), h('code.text-reset', state.connectionSettings.host),
        h('strong', ' Port: '), h('code.text-reset', state.connectionSettings.port.toString()),
        h('br'),
        h('strong', 'Http basic auth:'), httpBasicAuth ? ' On' : ' Off',
        h('br'),
        h('small.text-muted',
          'Connection settings can be changed in the config file: ',
          h('code.text-reset', state.settings.config.configFile),
          ' or as command line arguments'
        )
      ),
      h('form', { id: 'addname', onsubmit: onSubmit },
        h('div',
          h('label', { for: 'name' }, h('strong', 'Name:')),
          h('input', { type: 'text', id: 'name', value: state.setName, name: 'name', oninput: updateName }),
          h('small.form-text.text-muted', 'Your name is derived from your public key unless you choose another one')
        ),
        h('div',
          h('label', { for: 'downloadPath' }, h('strong', 'Download path:')),
          h('input', { type: 'text', id: 'downloadPath', value: state.setDownloadPath, name: 'downloadPath', size: 60, oninput: updateDownloadPath })
        ),
        h('input.btn.btn-outline-success', { type: 'submit', value: 'Update settings' }),
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

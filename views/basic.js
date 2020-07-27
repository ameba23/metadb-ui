const createRequest = require('../request')
const h = require('hyperscript')
const html = require('choo/html')
const { formData, readableBytes } = require('../util')

module.exports = function (state, emit, content) {
  const request = createRequest(state.connectionSettings)
  return h('body',
    h('h3',
      h('form', { id: 'search', onsubmit: onSubmit },
        icon(),
        h('strong', ' metadb'), ' - ',
        h('a', { href: '#connection' }, 'connection'), ' - ',
        h('a', { href: '#' }, 'files'), ' - ',
        h('a', { href: '#shares' }, 'shares'), ' - ',
        h('a', { href: '#peers' }, 'peers'), ' - ',
        h('a', { href: '#settings' }, 'settings'), ' - ',
        h('a', { href: '#transfers' }, 'transfers'), ' - ',
        h('input', { type: 'text', id: 'searchterm', value: '', name: 'searchterm' }),
        h('input', { type: 'submit', value: 'search' })
      )),
    h('p', `${state.settings.filesInDb || '?'} files in db (${readableBytes(state.settings.bytesInDb || 0)}). ${displayConnections()} ${displayConnectedPeers()}`),
    // h('p', `${JSON.stringify(state.wsEvents)}`),
    // h('h1.bg-pink.pa3.h-100.w-100.tc.red', 'hello'),
    h('hr'),
    state.connectionError ? connectionError : undefined,
    content
  )

  function displayConnections () {
    if (!state.settings.swarms) return ''
    const swarms = Object.keys(state.settings.swarms).filter(s => state.settings.swarms[s])
    return swarms.length
      ? `Connected to ${swarms.length} swarm${swarms.length === 1 ? '' : 's'}.`
      : 'Not connected.'
  }

  function displayConnectedPeers () {
    return state.settings.connectedPeers
      ? JSON.stringify(state.settings.connectedPeers)
      : ''
  }

  function connectionError () {
    return h('span',
      h('h2', `Error when trying to connect to the API on
        ${state.connectionSettings.host}:${state.connectionSettings.port}.`),
      h('h3', 'Is the metadb API running?'),
      h('form', { id: 'connection', onsubmit: onSubmitConnection },
        h('p',
          h('label', { for: 'host' }, 'Host:'),
          h('input', { type: 'text', id: 'host', name: 'host', value: state.connectionSettings.host }),
          h('label', { for: 'port' }, ':'),
          h('input', { type: 'text', id: 'port', name: 'port', value: state.connectionSettings.port })
        ),
        h('input', { type: 'submit', value: 'Update connection settings' })
      ),
      h('hr')
    )
  }

  function onSubmitConnection (e) {
    //TODO
  }

  function onSubmit (e) {
    e.preventDefault()
    var form = e.currentTarget
    var thing = formData(form)
    // TODO this request should be in the store
    request.post('/files/search', thing)
      .then((res) => {
        emit('searchResult', res)
      })
      .catch(console.log)
  }
}

function icon () {
  return html`
<svg xmlns="http://www.w3.org/2000/svg" width="20" hieght="20" viewBox="0 0 512 512"><path d="M464 128H272l-54.63-54.63c-6-6-14.14-9.37-22.63-9.37H48C21.49 64 0 85.49 0 112v288c0 26.51 21.49 48 48 48h416c26.51 0 48-21.49 48-48V176c0-26.51-21.49-48-48-48zm0 272H48V112h140.12l54.63 54.63c6 6 14.14 9.37 22.63 9.37H464v224z"/></svg>
  `
}

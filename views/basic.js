const createRequest = require('../request')
const h = require('hyperscript')
// const { readableBytes } = require('../util')
const icons = require('../icons')
const { spinner } = require('../components')

module.exports = function (state, emit, content) {
  const request = createRequest(state.connectionSettings)
  const swarms = state.settings.swarms
    ? Object.keys(state.settings.swarms).filter(s => state.settings.swarms[s])
    : []
  const numberConnectedPeers = state.settings.connectedPeers
    ? state.settings.connectedPeers.length
    : 0
  const me = state.peers.find(p => p.feedId === state.settings.key)
  const numberShares = me ? me.files || 0 : 0

  state.searchterm = ''

  return h('body',
    h('nav.navbar.navbar-expand-lg.navbar-light.bg-light',
      // h('button.navbar-toggler', { type: 'button', 'data-toggle': 'collapse', 'data-target': '#navbarSupportedContent', 'aria-controls': 'navbarSupportedContent', 'aria-expanded': 'false', 'aria-label': 'Toggle navigation' },
      //   h('span.navbar-toggler-icon')
      // ),
      h('p.navbar-brand', h('code.text-reset', 'metadb')),
      // h('div.collapse.navbar-collapse', { id: 'navbarSupportedContent' },
      h('ul.navbar-nav.mr-auto',

        h(`li.nav-item${(state.route === 'connection') ? '.active' : ''}`,
          { title: `Connected to ${swarms.length} swarm${swarms.length === 1 ? '' : 's'}` },
          h('a.nav-link', { href: '#connection' },
            icons.use('hdd-network'),
            ' connections ',
            h('small', h('strong', swarms.length))
          )
        ),

        h(`li.nav-item${(state.route === '/') ? '.active' : ''}`,
          { title: `${state.settings.filesInDb} files in database` },
          h('a.nav-link', { href: '#' },
            icons.use('files'),
            ' files ',
            h('small', h('strong',
              state.settings.filesInDb === undefined
                ? spinner()
                : state.settings.filesInDb
            )),
            state.wsEvents.syncing ? 'SYNCING' : ''
          )
        ),

        h(`li.nav-item${(state.route === 'shares') ? '.active' : ''}`,
          { title: state.wsEvents.indexingFiles
            ? `Indexing directory ${state.wsEvents.indexingFiles}`
            : `Sharing ${numberShares} files`
          },
          h('a.nav-link', { href: '#shares' },
            icons.use('server'),
            ' shares ',
            state.wsEvents.indexingFiles
              ? spinner()
              : h('small', h('strong', numberShares))
          )
        ),

        h(`li.nav-item${(state.route === 'peers') ? '.active' : ''}`,
          { title: numberConnectedPeers === 0
            ? 'No connected peers'
            : `Connected to ${numberConnectedPeers} peer${numberConnectedPeers === 1 ? '' : 's'}`
          },
          h('a.nav-link', { href: '#peers' },
            icons.use('people'),
            ' peers ',
            h('small', h('strong', numberConnectedPeers))
          )
        ),

        h(`li.nav-item${(state.route === 'settings') ? '.active' : ''}`,
          h('a.nav-link', { href: '#settings' },
            icons.use('gear'),
            ' settings'
          )
        ),

        h(`li.nav-item${(state.route === 'transfers') ? '.active' : ''}`,
          h('a.nav-link', { href: '#transfers' },
            icons.use('arrow-down-up'),
            ' transfers'
          )
        )
      ),
      h('form.form-inline.my-2.my-lg-0', { onsubmit: submitSearch },
        h('div.input-group.mb3',
          h('input.form-control.mr-sm-2', { type: 'search', id: 'searchterm', value: state.searchterm, name: 'searchterm', oninput: updateSearchterm, 'aria-label': 'Search' }),
          h('div.input-group-append',
            h('button.btn.btn-success', { type: 'submit', class: 'button-addon2' }, 'Search')
          )
        )
      )
      // )
    ),
    // h('h1.bg-pink.pa3.h-100.w-100.tc.red', 'hello'),

    h('div.container',
      // h('p', `${state.settings.filesInDb || '?'} files in db (${readableBytes(state.settings.bytesInDb || 0)}). ${displayConnections()} ${displayConnectedPeers()}`),
      // h('p', `${JSON.stringify(state.wsEvents)}`),
      state.connectionError ? connectionError : undefined,
      content
    ),
    icons.build()
  )

  function updateSearchterm (event) {
    state.searchterm = event.target.value
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
    // TODO
  }

  function submitSearch (event) {
    event.preventDefault()
    // TODO this request should be in the store
    request.post('/files/search', { searchterm: state.searchterm })
      .then((res) => {
        emit('searchResult', res)
      })
      .catch(console.log)
  }
}

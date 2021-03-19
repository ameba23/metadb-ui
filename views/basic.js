const h = require('hyperscript')
const icons = require('../icons')
const { spinner } = require('../components')

module.exports = function (state, emit, content) {
  const request = state.request
  const swarms = state.settings.swarms
    ? Object.keys(state.settings.swarms).filter(s => state.settings.swarms[s])
    : []
  const numberConnectedPeers = state.settings.connectedPeers
    ? state.settings.connectedPeers.length
    : 0
  const me = state.peers.find(p => p.feedId === state.settings.key)
  const numberShares = me ? me.files || 0 : 0

  const downloading = false
  // const downloading = state.wsEvents.download
  //   ? Object.keys(state.wsEvents.download).filter(f => !state.wsEvents.downloaded[f]).length
  //   : false
  console.log('DNLD', downloading)

  state.searchterm = ''

  return h('body',
    h('nav.navbar.navbar-expand-lg.navbar-light.bg-light',
      // h('button.navbar-toggler', { type: 'button', 'data-toggle': 'collapse', 'data-target': '#navbarSupportedContent', 'aria-controls': 'navbarSupportedContent', 'aria-expanded': 'false', 'aria-label': 'Toggle navigation' },
      //   h('span.navbar-toggler-icon')
      // ),
      h('p.navbar-brand', icons.logo()),
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
          { title: `${state.settings.totals.files} files in database` },
          h('a.nav-link', { href: '#' },
            icons.use('files'),
            ' files ',
            h('small', h('strong',
              state.settings.totals.files === undefined
                ? spinner()
                : state.settings.totals.files
            )),
            (state.wsEvents.syncing || state.wsEvents.dbIndexing)
              ? spinner()
              : undefined
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
          { title: downloading ? 'Downloading...' : 'Uploads and downloads' },
          h('a.nav-link', { href: '#transfers' },
            icons.use('arrow-down-up'),
            ' transfers ',
            downloading ? spinner() : undefined
          )
        )
      ),
      h('form.form-inline.my-2.my-lg-0', { onsubmit: submitSearch },
        h('div.input-group.mb3',
          h('input.form-control', { type: 'search', id: 'searchterm', value: state.searchterm, name: 'searchterm', oninput: updateSearchterm, 'aria-label': 'Search', placeholder: 'Search' }),
          h('div.input-group-append',
            h('button.btn.btn-outline-success', { type: 'submit', class: 'button-addon2' }, icons.use('search'))
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
      h('h2.bg-danger', `Error when trying to connect to the API on
        ${state.connectionSettings.host}:${state.connectionSettings.port}.`),
      h('h3', `Is the metadb API running at ${state.connectionSettings.host}:${state.connectionSettings.port}? `)
    )
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

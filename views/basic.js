const h = require('hyperscript')
const icons = require('../icons')
// const { spinner } = require('../components')

module.exports = function (state, emit, content) {
  const swarms = [1]
  state.searchterm = ''

  return h('body',
    h('nav.navbar.navbar-expand-lg.navbar-light.bg-light',
      h('p.navbar-brand', icons.logo()),
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
          { title: 'Files view' }, // TODO
          h('a.nav-link', { href: '#' },
            icons.use('files'),
            ' files'
          )
        )

        // h(`li.nav-item${(state.route === 'shares') ? '.active' : ''}`,
        //   { title: state.wsEvents.indexingFiles
        //     ? `Indexing directory ${state.wsEvents.indexingFiles}`
        //     : `Sharing ${numberShares} files`
        //   },
        //   h('a.nav-link', { href: '#shares' },
        //     icons.use('server'),
        //     ' shares ',
        //     state.wsEvents.indexingFiles
        //       ? spinner()
        //       : h('small', h('strong', numberShares))
        //   )
        // ),

        // h(`li.nav-item${(state.route === 'peers') ? '.active' : ''}`,
        //   { title: numberConnectedPeers === 0
        //     ? 'No connected peers'
        //     : `Connected to ${numberConnectedPeers} peer${numberConnectedPeers === 1 ? '' : 's'}`
        //   },
        //   h('a.nav-link', { href: '#peers' },
        //     icons.use('people'),
        //     ' peers ',
        //     h('small', h('strong', numberConnectedPeers))
        //   )
        // ),

        // h(`li.nav-item${(state.route === 'settings') ? '.active' : ''}`,
        //   h('a.nav-link', { href: '#settings' },
        //     icons.use('gear'),
        //     ' settings'
        //   )
        // ),

        // h(`li.nav-item${(state.route === 'transfers') ? '.active' : ''}`,
        //   { title: downloading ? 'Downloading...' : 'Uploads and downloads' },
        //   h('a.nav-link', { href: '#transfers' },
        //     icons.use('arrow-down-up'),
        //     ' transfers ',
        //     downloading ? spinner() : undefined
        //   )
        // )
      ),
      h('form.form-inline.my-2.my-lg-0', // TODO { onsubmit: submitSearch },
        h('div.input-group.mb3',
          h('input.form-control', { type: 'search', id: 'searchterm', value: state.searchterm, name: 'searchterm', oninput: updateSearchterm, 'aria-label': 'Search', placeholder: 'Search' }),
          h('div.input-group-append',
            h('button.btn.btn-outline-success', { type: 'submit', class: 'button-addon2' }, icons.use('search'))
          )
        )
      )
      // )
    ),

    h('div.container',
      state.connectionError ? connectionError : undefined,
      content
    ),
    icons.build()
  )

  function updateSearchterm (event) {
    state.searchterm = event.target.value
  }

  function connectionError () {
    return h('span', 'Cannot connect')
    // return h('span',
    //   h('h2.bg-danger', `Error when trying to connect to the API on
    //     ${state.connectionSettings.host}:${state.connectionSettings.port}.`),
    //   h('h3', `Is the harddrive-party API running at ${state.connectionSettings.host}:${state.connectionSettings.port}? `)
    // )
  }
}

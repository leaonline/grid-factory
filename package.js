/* eslint-env meteor */

Package.describe({
  name: 'leaonline:grid-factory',
  version: '1.4.0',
  // Brief, one-line summary of the package.
  summary: 'Create FilesCollections with GridFS storage. Lightweight. Simple.',
  // URL to the Git repository containing the source code for this package.
  git: 'git@github.com:leaonline/grid-factory.git',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md',
})

Package.onUse((api) => {
  api.versionsFrom(['1.6', '2.8.0', '3.0.1'])
  api.use('ecmascript')
  api.use('check')
  api.use('mongo')
  api.use('ostrio:files@2.0.0 || 3.0.0-rc.3', ['server', 'client'], {
    weak: true,
  })
  api.mainModule('grid-factory-client.js', 'client')
  api.mainModule('grid-factory-server.js', 'server')
})

Package.onTest((api) => {
  api.use('ecmascript')
  api.use('tinytest')
  api.use('random')
  api.use('ostrio:files')
  api.use([
    'lmieulet:meteor-coverage@5.0.0',
    'meteortesting:mocha@3.3.0'
  ])
  api.use('leaonline:grid-factory')
  api.mainModule('tests/grid-factory-server.tests.js', 'server')
  api.mainModule('tests/grid-factory-client.tests.js', 'client')
})

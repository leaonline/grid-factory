Package.describe({
  name: 'leaonline:grid-factory',
  version: '1.0.0',
  // Brief, one-line summary of the package.
  summary: 'Create FilesCollections with GridFS storage. Lightweight. Simple.',
  // URL to the Git repository containing the source code for this package.
  git: 'git@github.com:leaonline/grid-factory.git',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
})

Package.onUse(function (api) {
  api.versionsFrom('1.10.2')
  api.use('ecmascript')
  api.use('check')
  api.use('ostrio:files@1.0.0', ['server', 'client'], { weak: true })
  api.mainModule('grid-factory-client.js', 'client')
  api.mainModule('grid-factory-server.js', 'server')
})

Package.onTest(function (api) {
  Npm.depends({
    chai: '4.2.0'
  })
  api.use('ecmascript')
  api.use('tinytest')
  api.use('random')
  api.use('ostrio:files')
  api.use('meteortesting:mocha')
  api.use('leaonline:grid-factory')
  api.mainModule('grid-factory-tests.js')
})

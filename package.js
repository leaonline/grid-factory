Package.describe({
  name: 'leaonline:files-collection-factory',
  version: '1.0.0',
  // Brief, one-line summary of the package.
  summary: 'Create FilesCollections. Lightweight. Simple.',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
})

Package.onUse(function (api) {
  api.versionsFrom('1.10.2')
  api.use('ecmascript')
  api.use('check')
  api.use('ostrio:files', ['server', 'client'], { weak: true })
  api.mainModule('files-collection-factory-client.js', 'client')
  api.mainModule('files-collection-factory-server.js', 'server')
})

Package.onTest(function (api) {
  api.use('ecmascript')
  api.use('tinytest')
  api.use('leaonline:files-collection-factory')
  api.mainModule('files-collection-factory-tests.js')
})

/* eslint-env mocha */
import { expect } from 'chai'
import { createGridFilesFactory } from '../grid-factory-server'

import './common/utils.tests'
import './common/getLog.tests'
import './common/getCheckSize.tests'
import './common/getCheckUser.tests'
import './common/getCheckExtension.tests'
import './common/getBeforeUpload.tests'

describe('lib/server', function () {
  require('./server/getMoveToGrid.tests')
  require('./server/getAfterUpload.tests')
  require('./server/getOnProtected.tests')
  require('./server/getGridFsFileId.tests')
  require('./server/getContentDisposition.tests')
  require('./server/getInterceptDownload.tests')
  require('./server/getBeforeRemove.tests')
  require('./server/getAfterRemove.tests')
})

describe(createGridFilesFactory.name, function () {
  describe('server constructor', function () {
    it('can be created with minimal args', function () {
      const factory = createGridFilesFactory()
      expect(factory).to.be.a('function')
    })
    it('allows an i18nFactory to be passed', function () {
      const factory = createGridFilesFactory({
        i18nFactory: () => {}
      })
      expect(factory).to.be.a('function')
    })
    it('allows fs to be passed', function () {
      const factory = createGridFilesFactory({
        fs: { createReadStream: () => {} }
      })
      expect(factory).to.be.a('function')
    })
    it('allows fa bucket factory to be passed', function () {
      const factory = createGridFilesFactory({
        bucketFactory: () => {}
      })
      expect(factory).to.be.a('function')
    })
    it('allows a default bucket name to be passed', function () {
      const factory = createGridFilesFactory({
        defaultBucket: 'allFiles'
      })
      expect(factory).to.be.a('function')
    })
    it('allows a gridFsFileId factory to be passed', function () {
      const factory = createGridFilesFactory({
        createObjectId: () => {}
      })
      expect(factory).to.be.a('function')
    })
    it('allows an error hook to be passed', function () {
      const factory = createGridFilesFactory({
        onError: () => {}
      })
      expect(factory).to.be.a('function')
    })
  })
})

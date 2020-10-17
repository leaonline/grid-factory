/* global describe it */
import { expect } from 'chai'
import { createGridFilesFactory } from 'meteor/leaonline:grid-factory'
import { getLog } from './lib/both/getLog'
import { getCheckUser } from './lib/both/getCheckUser'
import { getCheckSize } from './lib/both/getCheckSize'
import { getCheckExtension } from './lib/both/getCheckExtension'
import { getBeforeUpload } from './lib/both/getBeforeUpload'

const onServer = fct => Meteor.isServer && fct()
const onClient = fct => Meteor.isCLient && fct()

describe('lib', function () {

  describe(getLog.name, function () {
    it('is not implemented')
  })
  describe(getCheckUser.name, function () {
    it('is not implemented')
  })
  describe(getCheckSize.name, function () {
    it('is not implemented')
  })
  describe(getCheckExtension.name, function () {
    it('is not implemented')
  })
  describe(getBeforeUpload.name, function () {
    it('is not implemented')
  })

  onServer(function () {
    import { getOnProtected } from './lib/server/getOnProtected'
    import { getAfterUpload } from './lib/server/getAfterUpload'
    import { getContentDisposition } from './lib/server/getContentDisposition'
    import { getMoveToGrid } from './lib/server/getMoveToGrid'
    import { getGridFsFileId } from './lib/server/getGridFsFileId'
    import { getBeforeRemove } from './lib/server/getBeforeRemove'
    import { getAfterRemove } from './lib/server/getAfterRemove'
    import { getInterceptDownload } from './lib/server/getInterceptDownload'

    describe(getMoveToGrid.name, function () {
      it('is not implemented')
    })

    describe(getAfterUpload.name, function () {
      it('is not implemented')
    })

    describe(getOnProtected.name, function () {
      it('is not implemented')
    })

    describe(getGridFsFileId.name, function () {
      it('is not implemented')
    })

    describe(getContentDisposition.name, function () {
      it('is not implemented')
    })

    describe(getInterceptDownload.name, function () {
      it('is not implemented')
    })

    describe(getBeforeRemove.name, function () {
      it('is not implemented')
    })
    describe(getAfterRemove.name, function () {
      it('is not implemented')
    })
  })
})

describe(createGridFilesFactory.name, function () {
  onServer(function () {
    describe('server constructor', function () {
      it('is not implemented')
    })
  })

  onClient(function () {
    describe('client constructor', function () {
      it('is not implemented')
    })
  })

  describe('error hooks', function () {
    it('is not implemented')
  })
})
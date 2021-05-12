/* eslint-env mocha */
import { Random } from 'meteor/random'
import { expect } from 'chai'
import { createGridFilesFactory } from '../grid-factory-server'

import './common/utils.tests'
import './common/getLog.tests'
import './common/getCheckSize.tests'
import './common/getCheckUser.tests'
import './common/getCheckExtension.tests'
import './common/getBeforeUpload.tests'

import { getAfterUpload } from '../lib/server/getAfterUpload'
import { getMoveToGrid } from '../lib/server/getMoveToGrid'
import { getOnProtected } from '../lib/server/getOnProtected'
import { getContentDisposition } from '../lib/server/getContentDisposition'
import { getGridFsFileId } from '../lib/server/getGridFsFileId'
import { getBeforeRemove } from '../lib/server/getBeforeRemove'
import { getAfterRemove } from '../lib/server/getAfterRemove'
import { getInterceptDownload } from '../lib/server/getInterceptDownload'

describe('lib/server', function () {
  describe(getAfterUpload.name, function () {
    it('is not implemented')
  })

  describe(getMoveToGrid.name, function () {
    it('is not implemented')
  })

  describe(getOnProtected.name, function () {
    it('throws if no checkUser function is passed', function () {
      expect(() => getOnProtected({})).to.throw('Match error: Expected function, got undefined')
    })
    it('returns true if user check is undefined', function () {
      const env = { foo: Random.id() }
      const file = { foo: Random.id() }
      const checkUser = (self, file, type) => {
        expect(self).to.deep.equal(env)
        expect(file).to.deep.equal(file)
        expect(type).to.equal('download')
      }
      const onProtected = getOnProtected({ checkUser })
      expect(onProtected.call(env, file)).to.equal(true)
    })
    it('returns false if user check is not undefined', function () {
      const checkUser = () => 'not permitted'
      const onProtected = getOnProtected({ checkUser })
      expect(onProtected()).to.equal(false)
    })
  })

  describe(getGridFsFileId.name, function () {
    it('return a gridFsFileId if it is linked in meta for the given version', function () {
      const gridFsFileId = Random.id()
      const versions = {
        foo: {
          meta: { gridFsFileId }
        }
      }

      expect(getGridFsFileId(versions, 'foo')).to.equal(gridFsFileId)
      expect(getGridFsFileId({}, 'foo')).to.equal(undefined)
      expect(getGridFsFileId({ any: {} }, 'foo')).to.equal(undefined)
      expect(getGridFsFileId({ foo: {} }, 'foo')).to.equal(undefined)
      expect(getGridFsFileId({ any: { meta: {} } }, 'foo')).to.equal(undefined)
      expect(getGridFsFileId({ foo: { meta: {} } }, 'foo')).to.equal(undefined)
    })
    it('searches in other versions as fallback', function () {
      const gridFsFileId = Random.id()
      const versions = {
        foo: {},
        bar: {
          meta: { gridFsFileId }
        }
      }

      expect(getGridFsFileId(versions, 'foo')).to.equal(gridFsFileId)
      expect(getGridFsFileId(versions, 'bar')).to.equal(gridFsFileId)
      expect(getGridFsFileId(versions, Random.id(4))).to.equal(gridFsFileId)
    })
  })

  describe(getContentDisposition.name, function () {
    it('returns the correct content disposition for filename and wihout flag', function () {
      const fileName = Random.id()
      const encodedName = encodeURIComponent(fileName)
      const expected = `inline; filename="${encodedName}"; filename=*UTF-8"${encodedName}"; charset=utf-8`
      expect(getContentDisposition(fileName)).to.equal(expected)
    })
    it('returns the correct content disposition for filename and with download flag', function () {
      const fileName = Random.id()
      const encodedName = encodeURIComponent(fileName)
      const expected = `attachment; filename="${encodedName}"; filename=*UTF-8"${encodedName}"; charset=utf-8`
      expect(getContentDisposition(fileName, 'true')).to.equal(expected)
    })
  })

  describe(getInterceptDownload.name, function () {
    it('is not implemented')
  })

  describe(getBeforeRemove.name, function () {
    it('throws if no checkUser function is passed', function () {
      expect(() => getBeforeRemove({})).to.throw('Match error: Expected function, got undefined')
    })
    it('returns true if user check is undefined', function () {
      const env = { foo: Random.id() }
      const file = { foo: Random.id() }
      const checkUser = (self, file, type) => {
        expect(self).to.deep.equal(env)
        expect(file).to.deep.equal(file)
        expect(type).to.equal('remove')
      }
      const beforeRemove = getBeforeRemove({ checkUser })
      expect(beforeRemove.call(env, file)).to.equal(true)
    })
    it('returns false if user check is not undefined', function () {
      const checkUser = () => 'not permitted'
      const beforeRemove = getBeforeRemove({ checkUser })
      expect(beforeRemove()).to.equal(false)
    })
  })
  describe(getAfterRemove.name, function () {
    it('is not implemented')
  })
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

  describe('error hooks', function () {
    it('is not implemented')
  })
})

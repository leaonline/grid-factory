/* eslint-env mocha */
import { Random } from 'meteor/random'
import { expect } from 'chai'
import { getAfterUpload } from '../../lib/server/getAfterUpload'
import { mockCollection } from '../utils/mockCollection'
import { stub, restoreAll } from '../utils/stub'

const collection = mockCollection()

describe(getAfterUpload.name, () => {
  beforeEach(async () => {
    await collection.removeAsync({})
  })
  afterEach(() => {
    restoreAll()
  })

  it('calls validateMime if active', async () => {
    const value = Random.id(6)
    const i18nFactory = () => value
    const log = () => value
    const debug = true
    const expectedFile = { _id: Random.id() }
    await collection.insertAsync(expectedFile)

    const unlinkAsync = async (doc) => {
      expect(doc).to.deep.equal(expectedFile)
    }
    const removeAsync = async (fileId) => {
      expect(fileId).to.equal(expectedFile._id)
    }

    let mimeChecked = false
    const validateMime = function (file, options) {
      expect(this.value).to.equal(value)

      // check if file is passed
      expect(file).to.deep.equal(expectedFile)

      // check if options are passed
      expect(options.translate()).to.equal(value)
      expect(options.log()).to.equal(value)

      mimeChecked = true
    }

    const onAfterUpload = getAfterUpload({
      validateMime,
      i18nFactory,
      log,
      debug,
    })

    const environment = { value, collection, unlinkAsync, removeAsync }
    const completed = await onAfterUpload.call(environment, expectedFile)
    expect(completed).to.equal(true)
    expect(mimeChecked).to.equal(true)
  })
  it('cancels if validateMime failed', async () => {
    const value = Random.id(6)
    const i18nFactory = () => value
    const log = () => value
    const debug = true
    const expectedFile = { _id: Random.id() }
    await collection.insertAsync(expectedFile)

    let unlinkCalled = false
    let removeCalled = false
    const unlinkAsync = async (doc) => {
      expect(doc).to.deep.equal(expectedFile)
      unlinkCalled = true
    }
    const removeAsync = async (fileId) => {
      expect(fileId).to.equal(expectedFile._id)
      removeCalled = true
    }

    const mimeChecked = false
    const validateMime = (/* file, options */) => {
      throw new Error('invalid mime')
    }

    const onAfterUpload = getAfterUpload({
      validateMime,
      i18nFactory,
      log,
      debug,
    })

    const environment = { value, collection, unlinkAsync, removeAsync }
    const completed = await onAfterUpload.call(environment, expectedFile)
    expect(completed).to.equal(false)
    expect(mimeChecked).to.equal(false)
    expect(unlinkCalled).to.equal(true)
    expect(removeCalled).to.equal(true)
  })
  it('calls transformVersions if active', async () => {
    const value = Random.id(6)
    const i18nFactory = () => value
    const log = () => value
    const debug = true
    const expectedFile = { _id: Random.id() }

    let transformCalled = false

    const onAfterUpload = getAfterUpload({
      transformVersions: function (file, options) {
        expect(this.value).to.equal(value)

        // check if file is passed
        expect(file).to.deep.equal(expectedFile)

        // check if options are passed
        expect(options.translate()).to.equal(value)
        expect(options.log()).to.equal(value)

        transformCalled = true
      },
      i18nFactory,
      log,
      debug,
    })

    const environment = { value, collection }
    const completed = await onAfterUpload.call(environment, expectedFile)
    expect(completed).to.equal(true)
    expect(transformCalled).to.equal(true)
  })
  it('removes file if transformVersions failed', async () => {
    const value = Random.id(6)
    const i18nFactory = () => value
    const log = () => value
    const debug = true
    const expectedFile = { _id: Random.id() }
    await collection.insertAsync(expectedFile)

    const transformCalled = false
    let unlinkCalled = false
    let removeCalled = false
    const unlinkAsync = async (doc) => {
      expect(doc).to.deep.equal(expectedFile)
      unlinkCalled = true
    }
    const removeAsync = async (fileId) => {
      expect(fileId).to.equal(expectedFile._id)
      removeCalled = true
    }

    const onAfterUpload = getAfterUpload({
      transformVersions: (/* file, options */) => {
        throw new Error('transform failed')
      },
      i18nFactory,
      log,
      debug,
    })

    const environment = { value, collection, unlinkAsync, removeAsync }
    const completed = await onAfterUpload.call(environment, expectedFile)
    expect(completed).to.equal(false)
    expect(transformCalled).to.equal(false)
    expect(unlinkCalled).to.equal(true)
    expect(removeCalled).to.equal(true)
  })
  it('calls moveToGrid if active', async () => {
    const value = Random.id(6)
    const i18nFactory = () => value
    const log = () => value
    const debug = true
    const expectedFile = { _id: Random.id() }

    let moveToGridCalled = false

    const onAfterUpload = getAfterUpload({
      moveToGrid: (file, Collection, self) => {
        // check if environment is passed
        expect(self.value).to.equal(value)

        // check if file is passed
        expect(file).to.deep.equal(expectedFile)
        moveToGridCalled = true
      },
      i18nFactory,
      log,
      debug,
    })

    const environment = { value, collection }
    const completed = await onAfterUpload.call(environment, expectedFile)
    expect(completed).to.equal(true)
    expect(moveToGridCalled).to.equal(true)
  })
  it('calls them in async order', async () => {
    const called = []
    const onAfterUpload = getAfterUpload({
      async validateMime() {
        called.push('mime')
        return true
      },
      async transformVersions() {
        called.push('transform')
        return true
      },
      async moveToGrid() {
        called.push('move')
        return true
      },
    })

    const file = { _id: Random.id() }
    const environment = { collection }
    stub(collection, 'updateAsync', () => called.push('update'))
    const completed = await onAfterUpload.call(environment, file)
    called.push('complete')
    expect(completed).to.equal(true)

    expect(called).to.deep.equal([
      'mime',
      'transform',
      'move',
      'update',
      'complete',
    ])
  })
  it('sets the file as processingComplete once complete', async () => {
    const onAfterUpload = getAfterUpload({})
    const file = { _id: Random.id() }
    await collection.insertAsync(file)
    const environment = { collection }
    const completed = await onAfterUpload.call(environment, file)
    const updatedFile = collection.findOne(file._id)
    expect(updatedFile.processingComplete).to.equal(true)
    expect(completed).to.equal(true)
  })
  it('removes the file on any caught error', async () => {
    let errorHandlerPassed = false
    const onAfterUpload = getAfterUpload({
      validateMime() {
        throw new Error('expected test error')
      },
      log: () => {},
      onErrorHook(err) {
        expect(err.message).to.equal('expected test error')
        errorHandlerPassed = true
      },
    })
    const file = { _id: Random.id() }
    await collection.insertAsync(file)

    let unlinkCalled = false
    let removeCalled = false

    const environment = {
      collection,
      async unlinkAsync() {
        unlinkCalled = true
      },
      async removeAsync() {
        removeCalled = true
      },
    }
    const completed = await onAfterUpload.call(environment, file)
    expect(completed).to.equal(false)
    expect(unlinkCalled).to.equal(true)
    expect(removeCalled).to.equal(true)
    expect(errorHandlerPassed).to.equal(true)
  })
})

/* eslint-env mocha */
import { Random } from 'meteor/random'
import { expect } from 'chai'
import { getAfterUpload } from '../../lib/server/getAfterUpload'
import { mockCollection } from '../utils/mockCollection'
import { stub, restoreAll } from '../utils/stub'

const collection = mockCollection()

describe(getAfterUpload.name, function () {
  afterEach(function () {
    restoreAll()
  })

  it('calls validateMime if active', async function () {
    const value = Random.id(6)
    const i18nFactory = () => value
    const log = () => value
    const debug = true
    const expectedFile = { _id: Random.id() }

    let mimeChecked = false

    const onAfterUpload = getAfterUpload({
      validateMime: function (file, options) {
        // check if environment is passed
        const self = this
        expect(self.value).to.equal(value)

        // check if file is passed
        expect(file).to.deep.equal(expectedFile)

        // check if options are passed
        expect(options.translate()).to.equal(value)
        expect(options.log()).to.equal(value)
        expect(options.debug).to.equal(debug)

        mimeChecked = true
      },
      i18nFactory,
      log,
      debug
    })

    const environment = { value, collection }
    const completed = await onAfterUpload.call(environment, expectedFile)
    expect(completed).to.equal(true)
    expect(mimeChecked).to.equal(true)
  })
  it('calls transformVersions if active', async function () {
    const value = Random.id(6)
    const i18nFactory = () => value
    const log = () => value
    const debug = true
    const expectedFile = { _id: Random.id() }

    let transformCalled = false

    const onAfterUpload = getAfterUpload({
      transformVersions: function (file, options) {
        // check if environment is passed
        const self = this
        expect(self.value).to.equal(value)

        // check if file is passed
        expect(file).to.deep.equal(expectedFile)

        // check if options are passed
        expect(options.translate()).to.equal(value)
        expect(options.log()).to.equal(value)
        expect(options.debug).to.equal(debug)

        transformCalled = true
      },
      i18nFactory,
      log,
      debug
    })

    const environment = { value, collection }
    const completed = await onAfterUpload.call(environment, expectedFile)
    expect(completed).to.equal(true)
    expect(transformCalled).to.equal(true)
  })
  it('calls moveToGrid if active', async function () {
    const value = Random.id(6)
    const i18nFactory = () => value
    const log = () => value
    const debug = true
    const expectedFile = { _id: Random.id() }

    let moveToGridCalled = false

    const onAfterUpload = getAfterUpload({
      moveToGrid: function (file, Collection, self) {
        // check if environment is passed
        expect(self.value).to.equal(value)

        // check if file is passed
        expect(file).to.deep.equal(expectedFile)
        moveToGridCalled = true
      },
      i18nFactory,
      log,
      debug
    })

    const environment = { value, collection }
    const completed = await onAfterUpload.call(environment, expectedFile)
    expect(completed).to.equal(true)
    expect(moveToGridCalled).to.equal(true)
  })
  it('calls them in async order', async function () {
    const called = []
    const onAfterUpload = getAfterUpload({
      async validateMime () {
        called.push('mime')
        return true
      },
      async transformVersions () {
        called.push('transform')
        return true
      },
      async moveToGrid () {
        called.push('move')
        return true
      }
    })

    const file = { _id: Random.id() }
    const environment = { collection }
    stub(collection, 'update', () => called.push('update'))
    const completed = await onAfterUpload.call(environment, file)
    called.push('complete')
    expect(completed).to.equal(true)

    expect(called).to.deep.equal([
      'mime',
      'transform',
      'move',
      'update',
      'complete'
    ])
  })
  it('sets the file as processingComplete once complete', async function () {
    const onAfterUpload = getAfterUpload({})
    const file = { _id: Random.id() }
    collection.insert(file)
    const environment = { collection }
    const completed = await onAfterUpload.call(environment, file)
    const updatedFile = collection.findOne(file._id)
    expect(updatedFile.processingComplete).to.equal(true)
    expect(completed).to.equal(true)
  })
  it('removes the file on any catched error', async function () {
    let errorHandlerPassed = false
    const onAfterUpload = getAfterUpload({
      validateMime () {
        throw new Error('expected test error')
      },
      log: () => {},
      onErrorHook (err) {
        expect(err.message).to.equal('expected test error')
        errorHandlerPassed = true
      }
    })
    const file = { _id: Random.id() }
    collection.insert(file)

    let unlinkCalled = false
    let removeCalled = false

    const environment = {
      collection,
      unlink () { unlinkCalled = true },
      remove () { removeCalled = true }
    }
    const completed = await onAfterUpload.call(environment, file)
    expect(completed).to.equal(false)
    expect(unlinkCalled).to.equal(true)
    expect(removeCalled).to.equal(true)
    expect(errorHandlerPassed).to.equal(true)
  })
})

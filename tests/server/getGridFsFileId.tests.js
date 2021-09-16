/* eslint-env mocha */
import { Random } from 'meteor/random'
import { expect } from 'chai'
import { getGridFsFileId } from '../../lib/server/getGridFsFileId'

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

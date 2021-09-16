/* eslint-env mocha */
import { Random } from 'meteor/random'
import { expect } from 'chai'
import { getAfterRemove } from '../../lib/server/getAfterRemove'

describe(getAfterRemove.name, function () {
  it('removes all remaining versions from GridFS', function () {
    const gridFsFileId = Random.id()
    const onErrorHook = err => expect.fail(err)
    let deleted = false
    const bucket = {
      delete (gfsId, onError) {
        expect(onError).to.equal(onErrorHook)
        expect(gfsId).to.equal(gridFsFileId)
        deleted = true
      }
    }

    const files = [{
      _id: Random.id(),
      versions: {
        orginal: {
          meta: {
            gridFsFileId
          }
        }
      }
    }]
    const createObjectId = ({ gridFsFileId }) => gridFsFileId
    const onAfterRemove = getAfterRemove({
      bucket,
      createObjectId,
      onErrorHook
    })

    onAfterRemove(files)
    expect(deleted).to.equal(true)
  })
})

/* eslint-env mocha */
import { Random } from 'meteor/random'
import { expect } from 'chai'
import { getLog } from '../../lib/both/getLog'

describe(getLog.name, () => {
  it('returns an empty function if no debug flag is active', () => {
    const target = () => expect.fail()
    const log = getLog(false, target)
    log()
  })
  it('returns a debug logger when debug is active', () => {
    const value = Random.id(8)
    const log = getLog(true, (name, out) => {
      expect(name).to.equal('[FilesCollectionFactory]:')
      expect(out).to.equal(value)
    })
    log(value)
  })
})

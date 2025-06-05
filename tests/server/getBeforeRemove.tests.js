/* eslint-env mocha */
import { Random } from 'meteor/random'
import { expect } from 'chai'
import { getBeforeRemove } from '../../lib/server/getBeforeRemove'
import { expectThrow } from '../utils/expectThrow'

describe(getBeforeRemove.name, () => {
  const log = console.log

  it('throws if no checkUser function is passed', async () => {
    await expectThrow({
      fn: () => getBeforeRemove({}),
      message: 'Match error: Expected function, got undefined',
    })
  })
  it('returns true if user check is undefined', async () => {
    const env = { foo: Random.id() }
    const file = { foo: Random.id() }
    const checkUser = async (self, file, type) => {
      expect(self).to.deep.equal(env)
      expect(file).to.deep.equal(file)
      expect(type).to.equal('remove')
    }
    const beforeRemove = getBeforeRemove({ checkUser, log })
    expect(await beforeRemove.call(env, file)).to.equal(true)
  })
  it('returns false if user check is not undefined', async () => {
    const checkUser = () => 'not permitted'
    const beforeRemove = getBeforeRemove({ checkUser, log })
    expect(await beforeRemove()).to.equal(false)
  })
})

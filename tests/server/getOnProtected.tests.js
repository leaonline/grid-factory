/* eslint-env mocha */
import { Random } from 'meteor/random'
import { expect } from 'chai'
import { getOnProtected } from '../../lib/server/getOnProtected'
import { expectThrow } from '../utils/expectThrow'

describe(getOnProtected.name, () => {
  it('throws if no checkUser function is passed', async () => {
    await expectThrow({
      fn: () => getOnProtected({}),
      message: 'Match error: Expected function, got undefined',
    })
  })
  it('returns true if user check remains undefined', async () => {
    const env = { foo: Random.id() }
    const file = { foo: Random.id() }
    const checkUser = async (self, file, type) => {
      expect(self).to.deep.equal(env)
      expect(file).to.deep.equal(file)
      expect(type).to.equal('download')
    }
    const onProtected = getOnProtected({ checkUser })
    expect(await onProtected.call(env, file)).to.equal(true)
  })
  it('returns false if user check returns any non-undefined value', async () => {
    const checkUser = () => 'not permitted'
    const onProtected = getOnProtected({ checkUser })
    expect(await onProtected()).to.equal(false)
  })
})

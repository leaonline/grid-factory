/* eslint-env mocha */
import { Random } from 'meteor/random'
import { expect } from 'chai'
import { getBeforeRemove } from '../../lib/server/getBeforeRemove'

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

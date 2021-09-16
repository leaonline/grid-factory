/* eslint-env mocha */
import { Random } from 'meteor/random'
import { expect } from 'chai'
import { getOnProtected } from '../../lib/server/getOnProtected'

describe(getOnProtected.name, function () {
  it('throws if no checkUser function is passed', function () {
    expect(() => getOnProtected({})).to.throw('Match error: Expected function, got undefined')
  })
  it('returns true if user check remains undefined', function () {
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
  it('returns false if user check returns any non-undefined value', function () {
    const checkUser = () => 'not permitted'
    const onProtected = getOnProtected({ checkUser })
    expect(onProtected()).to.equal(false)
  })
})

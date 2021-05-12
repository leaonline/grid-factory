/* eslint-env mocha */
import { Random } from 'meteor/random'
import { expect } from 'chai'
import { getCheckUser } from '../../lib/both/getCheckUser'
import { getLog } from '../../lib/both/getLog'

describe(getCheckUser.name, function () {
  it('returns an empty function if validateUser is not given', function (done) {
    const log = getLog(true, (name, arg) => {
      expect(arg.includes('set user / access validation to [none]')).to.equal(true)
      done()
    })
    getCheckUser({ log })
  })
  it('allows to validate a user based on external validateUser fn', function () {
    const checkUser = getCheckUser({
      validateUser: function (user, file, type) {
        expect(user).to.equal(undefined)
        expect(file).to.equal(undefined)
        expect(type).to.equal(undefined)
        return true
      }
    })
    expect(checkUser()).to.equal(undefined)
  })
  it('returns a translatable message if validation failed', function () {
    const checkUser = getCheckUser({
      validateUser: function (user, file, type) {
        expect(user).to.equal(undefined)
        expect(file).to.equal(undefined)
        expect(type).to.equal(undefined)
        return false
      }
    })
    expect(checkUser()).to.equal('filesCollection.permissionDenied')
  })
  it('catches errors with an onErrorHook', function (done) {
    const errorId = Random.id()
    const checkUser = getCheckUser({
      validateUser: function () {
        throw new Error(errorId)
      },
      onErrorHook: err => {
        expect(err.message).to.equal(errorId)
        done()
      }
    })
    expect(checkUser()).to.equal('filesCollection.permissionDenied')
  })
})

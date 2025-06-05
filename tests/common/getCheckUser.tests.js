/* eslint-env mocha */
import { Random } from 'meteor/random'
import { expect } from 'chai'
import { getCheckUser } from '../../lib/both/getCheckUser'
import { getLog } from '../../lib/both/getLog'

describe(getCheckUser.name, () => {
  it('returns an empty function if validateUser is not given', async () => {
    let called = false
    const log = getLog(true, (name, arg) => {
      expect(arg.includes('set user / access validation to [none]')).to.equal(
        true,
      )
      called = true
    })
    await getCheckUser({ log })
    expect(called).to.equal(true)
  })
  it('allows to validate a user based on external validateUser fn', async () => {
    const checkUser = getCheckUser({
      validateUser: async (user, file, type) => {
        expect(user).to.equal(undefined)
        expect(file).to.equal(undefined)
        expect(type).to.equal(undefined)
        return true
      },
    })
    expect(await checkUser()).to.equal(undefined)
  })
  it('returns a translatable message if validation failed', async () => {
    const checkUser = getCheckUser({
      validateUser: async (user, file, type) => {
        expect(user).to.equal(undefined)
        expect(file).to.equal(undefined)
        expect(type).to.equal(undefined)
        return false
      },
    })
    expect(await checkUser()).to.equal('filesCollection.permissionDenied')
  })
  it('catches errors with an onErrorHook', async () => {
    let called = false
    const errorId = Random.id()
    const checkUser = getCheckUser({
      validateUser: async () => {
        throw new Error(errorId)
      },
      onErrorHook: (err) => {
        expect(err.message).to.equal(errorId)
        called = true
      },
    })
    expect(await checkUser()).to.equal('filesCollection.permissionDenied')
    expect(called).to.equal(true)
  })
})

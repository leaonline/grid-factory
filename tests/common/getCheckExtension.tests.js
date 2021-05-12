/* eslint-env mocha */
import { Random } from 'meteor/random'
import { expect } from 'chai'
import { getCheckExtension } from '../../lib/both/getCheckExtension'
import { getLog } from '../../lib/both/getLog'

describe(getCheckExtension.name, function () {
  it('returns an empty function if validateUser is not given', function (done) {
    const log = getLog(true, (name, arg) => {
      expect(arg.includes('set extensions check to [none]')).to.equal(true)
      done()
    })
    getCheckExtension({ log })
  })
  it('checks the extension against the given set', function () {
    const checkExtensions = getCheckExtension({
      extensions: ['foo', 'bar']
    })

    expect(checkExtensions({ extension: 'foo' })).to.equal(undefined)
    expect(checkExtensions({ extension: 'bar' })).to.equal(undefined)
    expect(checkExtensions({ extension: 'baz' })).to.equal('filesCollection.invalidExtension')
  })
  it('returns an i18n compatible string with options', function (done) {
    const extension = Random.id()
    const checkExtensions = getCheckExtension({
      extensions: ['foo', 'bar'],
      i18nFactory: (name, args) => {
        expect(name).to.equal('filesCollection.invalidExtension')
        expect(args).to.deep.equal({
          allowed: ['foo', 'bar'].join(', '),
          extension
        })
        done()
      }
    })
    checkExtensions({ extension })
  })
})

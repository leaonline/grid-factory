/* eslint-env mocha */
import { expect } from 'chai'
import { getCheckSize } from '../../lib/both/getCheckSize'
import { getLog } from '../../lib/both/getLog'

describe(getCheckSize.name, () => {
  it('returns an empty function if maxSize is not given', (done) => {
    const log = getLog(true, (name, arg) => {
      expect(arg.includes('set max-size validation to [none]')).to.equal(true)
      done()
    })
    getCheckSize({ log })
  })
  it('returns an empty function if maxSize is not positive', () => {
    let checked = false
    const log = getLog(true, (name, arg) => {
      if (!checked) {
        expect(arg.includes('set max-size validation to [none]')).to.equal(true)
        checked = true
      }
    })
    const checkSize = getCheckSize({ log, maxSize: -1 })
    const sizes = [0, -1, 100, 1000, -100, -1000]
    for (const size of sizes) {
      expect(checkSize({ size })).to.equal(undefined)
    }
    expect(checked).to.equal(true)
  })
  it('returns a function that checks the size of a file of maxSize is given', () => {
    const log = getLog(true, (name, arg) => {
      if (arg.includes('set max-size validation to [none]')) {
        expect.fail()
      }
    })
    const checkSize = getCheckSize({ log, maxSize: 100 })

    // expected true
    expect(checkSize({ size: 1 })).to.equal(undefined)
    expect(checkSize({ size: 10 })).to.equal(undefined)
    expect(checkSize({ size: 100 })).to.equal(undefined)

    // expected false
    expect(checkSize({ size: 0 })).to.equal('filesCollection.maxSizeExceed')
    expect(checkSize({ size: -1 })).to.equal('filesCollection.maxSizeExceed')
    expect(checkSize({ size: 100.01 })).to.equal('filesCollection.invalidSize')
    expect(checkSize({ size: Math.random() })).to.equal(
      'filesCollection.invalidSize',
    )
  })
  it('allows to pass the i18nFactory to translate errors', () => {
    let size = Math.random()
    getCheckSize({
      maxSize: 100,
      i18nFactory: (name, args) => {
        expect(name).to.equal('filesCollection.invalidSize')
        expect(args).to.deep.equal({ size })
      },
    })({ size })

    size = 1000001
    getCheckSize({
      maxSize: 1000000,
      i18nFactory: (name, args) => {
        expect(name).to.equal('filesCollection.maxSizeExceed')
        expect(args).to.deep.equal({
          size: '0.98',
          maxSize: '0.98',
        })
      },
    })({ size })
  })
})

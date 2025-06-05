/* eslint-env mocha */
import { expect } from 'chai'
import { isValidFloat, isValidInteger } from '../../lib/utils/validNumbers'

describe('utils', () => {
  describe(isValidInteger.name, () => {
    it('determines, whether a number is a valid integer', () => {
      const simpleNums = [-1, 0, 1]
      for (const num of simpleNums) {
        expect(isValidInteger(num), num).to.equal(true)
      }
      const moreNUms = [
        -1.1,
        1.1,
        undefined,
        null,
        '1',
        '0',
        '-1',
        {},
        [],
        Number.POSITIVE_INFINITY,
        Number.NEGATIVE_INFINITY,
        Number.MIN_SAFE_INTEGER - 1,
        Number.MAX_SAFE_INTEGER + 1,
      ]
      for (const num of moreNUms) {
        expect(isValidInteger(num), num).to.equal(false)
      }
    })
  })
  describe(isValidFloat.name, () => {
    it('determines valids', () => {
      const valids = [-1.1, 0, 1.1, 1.123456789]
      for (const num of valids) {
        expect(isValidFloat(num), num).to.equal(true)
      }
    })
    it('includes also integers', () => {
      const valids = [
        0,
        1,
        -1,
        Number.MIN_SAFE_INTEGER - 1,
        Number.MAX_SAFE_INTEGER + 1,
      ]
      for (const num of valids) {
        expect(isValidFloat(num), num).to.equal(true)
      }
    })
    it('determines invalids', () => {
      const invalids = [
        undefined,
        null,
        '1',
        '0',
        '-1',
        {},
        [],
        Number.POSITIVE_INFINITY,
        Number.NEGATIVE_INFINITY,
        Number.MAX_VALUE * 2,
        Number.MAX_VALUE * -1 * 2,
      ]
      for (const num of invalids) {
        expect(isValidFloat(num), num).to.equal(false)
      }
    })
  })
})

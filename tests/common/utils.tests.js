/* eslint-env mocha */
import { expect } from 'chai'
import { isValidFloat, isValidInteger } from '../../lib/utils/validNumbers'

describe('utils', function () {
  describe(isValidInteger.name, function () {
    it('determines, whether a number is a valid integer', function () {
      [-1, 0, 1].forEach(num => expect(isValidInteger(num), num).to.equal(true))
      ;[-1.1, 1.1, undefined, null, '1', '0', '-1', {}, [], Infinity, -Infinity, (Number.MIN_SAFE_INTEGER - 1), (Number.MAX_SAFE_INTEGER + 1)]
        .forEach(num => {
          expect(isValidInteger(num), num).to.equal(false)
        })
    })
  })
  describe(isValidFloat.name, function () {
    it('determines valids', function () {
      [-1.1, 0, 1.1, 1.1234567890]
        .forEach(num => expect(isValidFloat(num), num).to.equal(true))
    })
    it('includes also integers', function () {
      [0, 1, -1, Number.MIN_SAFE_INTEGER - 1, Number.MAX_SAFE_INTEGER + 1]
        .forEach(num => expect(isValidFloat(num), num).to.equal(true))
    })
    it('determines invalids', function () {
      [undefined, null, '1', '0', '-1', {}, [], Infinity, -Infinity, (Number.MAX_VALUE * 2), ((Number.MAX_VALUE * -1) * 2)]
        .forEach(num => expect(isValidFloat(num), num).to.equal(false))
    })
  })
})

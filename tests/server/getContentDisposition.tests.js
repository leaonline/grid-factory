/* eslint-env mocha */
import { Random } from 'meteor/random'
import { expect } from 'chai'
import { getContentDisposition } from '../../lib/server/getContentDisposition'

describe(getContentDisposition.name, () => {
  it('returns the correct content disposition for filename and wihout flag', () => {
    const fileName = Random.id()
    const encodedName = encodeURIComponent(fileName)
    const expected = `inline; filename="${encodedName}"; filename=*UTF-8"${encodedName}"; charset=utf-8`
    expect(getContentDisposition(fileName)).to.equal(expected)
  })
  it('returns the correct content disposition for filename and with download flag', () => {
    const fileName = Random.id()
    const encodedName = encodeURIComponent(fileName)
    const expected = `attachment; filename="${encodedName}"; filename=*UTF-8"${encodedName}"; charset=utf-8`
    expect(getContentDisposition(fileName, 'true')).to.equal(expected)
  })
})

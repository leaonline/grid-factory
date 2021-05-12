/* eslint-env mocha */
import { Random } from 'meteor/random'
import { expect } from 'chai'
import { getBeforeUpload } from '../../lib/both/getBeforeUpload'

describe(getBeforeUpload.name, function () {
  it('defers all checks to externals', function () {
    const env = { foo: Random.id() }
    const file = { foo: Random.id() }
    const beforeUpload = getBeforeUpload({
      log: out => expect(out).to.equal('before upload'),
      checkSize: file => {
        expect(file).to.deep.equal(file)
      },
      checkExtension: file => {
        expect(file).to.deep.equal(file)
      },
      checkUser: (env, file, type) => {
        expect(env).to.deep.equal(env)
        expect(file).to.deep.equal(file)
        expect(type).to.equal('upload')
      }
    })

    const checked = beforeUpload.call(env, file)
    expect(checked).to.equal(true)
  })
})

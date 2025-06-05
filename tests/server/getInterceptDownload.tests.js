/* eslint-env mocha */
import { getInterceptDownload } from '../../lib/server/getInterceptDownload'

describe(getInterceptDownload.name, () => {
  it('returns a function to intercept downloads', () => {})
  it('it returns by default a 200 response with the file content')
  it('it returns a 206 partial response for range requests')
  it('it returns a 500 response if an error occurs')
})

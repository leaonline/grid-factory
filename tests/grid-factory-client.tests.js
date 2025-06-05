/* eslint-env mocha */
// import { Random } from 'meteor/random'
// import { expect } from 'chai'
import { createGridFilesFactory } from 'meteor/leaonline:grid-factory'

import './common/utils.tests'
import './common/getLog.tests'
import './common/getCheckSize.tests'
import './common/getCheckUser.tests'
import './common/getCheckExtension.tests'
import './common/getBeforeUpload.tests'

describe(createGridFilesFactory.name, () => {
  describe('client constructor', () => {
    it('is not implemented')
  })

  describe('error hooks', () => {
    it('is not implemented')
  })
})

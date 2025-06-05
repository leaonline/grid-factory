import { check } from 'meteor/check'

export const getBeforeRemove = ({ checkUser, log } = {}) => {
  check(checkUser, Function)

  return async function beforeRemove (file) {
    const self = this
    const userChecked = await checkUser(self, file, 'remove')
    log('(beforeRemove)', { userChecked })
    return typeof userChecked === 'undefined'
  }
}

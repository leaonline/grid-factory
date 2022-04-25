import { check } from 'meteor/check'

export const getBeforeRemove = ({ checkUser, log } = {}) => {
  check(checkUser, Function)

  return function beforeRemove (file) {
    const self = this
    const userChecked = checkUser(self, file, 'remove')
    log('(beforeRemove)', { userChecked })
    return typeof userChecked === 'undefined'
  }
}

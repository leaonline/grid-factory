import { check } from 'meteor/check'

export const getBeforeRemove = ({ checkUser } = {}) => {
  check(checkUser, Function)

  return function beforeRemove (file) {
    const self = this
    const userChecked = checkUser(self, file, 'remove')
    return typeof userChecked === 'undefined'
  }
}

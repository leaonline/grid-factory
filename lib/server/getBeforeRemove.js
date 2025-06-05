import { check } from 'meteor/check'

export const getBeforeRemove = ({ checkUser, log } = {}) => {
  check(checkUser, Function)

  return async function beforeRemove(file) {
    const userChecked = await checkUser(this, file, 'remove')
    log('(beforeRemove)', { userChecked })
    return typeof userChecked === 'undefined'
  }
}

import { check } from 'meteor/check'

/**
 * Returns a handler than runs in onProtected and requires a checkUser fn
 * @param checkUser
 * @return {function(*=): boolean}
 */
export const getOnProtected = ({ checkUser } = {}) => {
  check(checkUser, Function)

  return function onProtected (file) {
    const self = this
    const userChecked = checkUser(self, file, 'download')
    return typeof userChecked === 'undefined'
  }
}

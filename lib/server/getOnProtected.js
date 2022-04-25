import { check } from 'meteor/check'

/**
 * Returns a handler than runs in onProtected and requires a checkUser fn
 * @param checkUser
 * @param log
 * @return {function(*=): boolean}
 */
export const getOnProtected = ({ checkUser, log = () => {} } = {}) => {
  check(checkUser, Function)

  return function onProtected (file) {
    const self = this
    const userChecked = checkUser(self, file, 'download')
    log('(onProtected) user checked', userChecked)
    return typeof userChecked === 'undefined'
  }
}

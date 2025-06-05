import { check } from 'meteor/check'

/**
 * Returns a handler than runs in onProtected and requires a checkUser fn
 * @param checkUser
 * @param log
 * @return {function(*=): Promise.<Boolean>}
 */
export const getOnProtected = ({ checkUser, log = () => {} } = {}) => {
  check(checkUser, Function)

  return async function onProtected(file) {
    const userChecked = await checkUser(this, file, 'download')
    log('(onProtected) user checked', userChecked)
    return typeof userChecked === 'undefined'
  }
}

/**
 * Allows to pipe the current user requesting a certain file in a certain
 * context and request type to an external validation function.
 *
 * Based on the external function's return value (truthy, falsy, throwing err)
 * will the operation be permitted or denied.
 *
 * @param validateUser
 * @param log
 * @param onErrorHook
 * @param i18nFactory
 * @return {*}
 */
export const getCheckUser = ({ validateUser, log = () => {}, onErrorHook = err => console.error(err), i18nFactory = x => x }) => {
  if (typeof validateUser !== 'function') {
    log('set user / access validation to [none]')
    return () => log('checkUser skipped')
  }

  log('set user validation to [active]')
  return function checkUser (context = {}, file, type) {
    let hasPermission = false

    try {
      log('checkUser', context.user, context.userId, type)
      // we first try to get the current user from the cookies
      // since FilesCollection requires cookies to set the current user
      // if the user exists, we need to pass it with the current file to the hook
      // and wait for a truthy/falsy return value to estimate permission
      let user = typeof context.user === 'function'
        ? context.user()
        : context.user

      if (!user && context.userId) {
        user = { _id: context.userId }
      }

      // if there is a validation hook defined we depend permission based on
      // this hook, otherwise we assume the collection is public for anyone
      // and allow anything, which
      hasPermission = validateUser
        ? validateUser(user, file, type, i18nFactory)
        : true
    } catch (validationError) {
      // we need to catch errors, because we can't control the hook environment
      onErrorHook(validationError)
      hasPermission = false
    }

    // if validation failed on any level we return the translated reason for the fail
    if (!hasPermission) {
      return i18nFactory('filesCollection.permissionDenied')
    }
  }
}

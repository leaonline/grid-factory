export const getCheckUser = ({ validateUser, log, onErrorHook, i18nFactory }) => {
  if (typeof validateUser !== 'function') {
    const warn = 'set user / access validation to [none]'
    log(`\x1b[31m${warn}\x1b[0m`)
    return () => log('checkUser skipped')
  }

  log('set user validation to [active]')
  return function checkUser (context, file, type) {
    let hasPermission

    try {
      log('checkUser', context.user, context.userId, type)
      // we first try to get the current user from the cookies
      // since FilesCollection requires cookies to set the current user
      // if the user exists, we need to pass it with the current file to the hook
      // and wait for a truthy/falsy return value to estimate permission
      const user = context.user && context.user()

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

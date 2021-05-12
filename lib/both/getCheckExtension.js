/**
 * Creates an extension check for a fixed set of extensions. Note, that
 * on server an additional mime check is done in order to ensure the file
 * content actually meets the given extension.
 *
 * @param i18nFactory
 * @param extensions
 * @param log
 * @return {checkExtension}
 */
export const getCheckExtension = ({ i18nFactory = x => x, extensions, log = () => {} }) => {
  if (!Array.isArray(extensions) || extensions.length === 0) {
    log('set extensions check to [none]')
    return () => log('checkExtension skipped')
  }

  const allowedExtensions = extensions.join(', ')
  log(`set allowed extensions to [${allowedExtensions}]`)

  return function checkExtension (file = {}) {
    const currentExtension = file.extension
    log('check extension', currentExtension)

    if (!currentExtension || !extensions.includes(currentExtension)) {
      return i18nFactory('filesCollection.invalidExtension', {
        allowed: allowedExtensions,
        extension: currentExtension
      })
    }
  }
}

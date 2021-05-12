import { isValidInteger } from '../utils/validNumbers'

/**
 * Returns a function that checks the size of a given file, if maxSize is
 * given. If no maxSize is given it skips the size check.
 * @protected
 * @param i18nFactory
 * @param maxSize
 * @param log
 * @return {checkSize}
 */

export const getCheckSize = ({ i18nFactory = x => x, maxSize, log = () => {} }) => {
  if (!isValidInteger(maxSize) || maxSize < 1) {
    log('[!attention] set max-size validation to [none]')
    return () => log('checkUser skipped')
  }

  const maxSizeMB = maxSize / 1024000
  log(`set max upload size to [${maxSizeMB} MB]`)

  return function checkSize (file) {
    if (!isValidInteger(file.size)) {
      return i18nFactory('filesCollection.invalidSize', { size: file.size })
    }

    if (maxSize && (file.size > maxSize || file.size < 1)) {
      return i18nFactory('filesCollection.maxSizeExceed', {
        maxSize: maxSizeMB.toFixed(2),
        size: (file.size / 1024000).toFixed(2)
      })
    }
  }
}

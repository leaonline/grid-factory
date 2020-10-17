export const getCheckSize = ({ i18nFactory, maxSize, log }) => {
  const maxSizeMB = maxSize / 1024000
  log(`set max upload size to [${maxSizeMB} MB]`)
  return function checkSize (file) {
    if (maxSize && file.size > maxSize) {
      return i18nFactory('filesCollection.maxSizeExceed', { maxSize: maxSizeMB })
    }
  }
}

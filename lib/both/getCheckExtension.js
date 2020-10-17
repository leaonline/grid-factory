export const getCheckExtension = ({ i18nFactory, extensions, log }) => {
  const allowedExtensions = extensions && extensions.join(', ')
  log(`set allowed extensions to [${allowedExtensions}]`)
  return function checkExtension (file) {
    log('check extension')
    if (extensions && !extensions.includes(file.extension)) {
      log(extensions, file.extension)
      return i18nFactory('filesCollection.invalidExtension', { allowed: allowedExtensions })
    }
  }
}

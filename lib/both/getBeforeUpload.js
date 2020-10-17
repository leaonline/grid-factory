export const getBeforeUpload = ({ log, checkSize, checkExtension, checkUser }) => {
  return function beforeUpload (file) {
    log('before upload')
    const self = this

    const sizeChecked = checkSize(file)
    if (typeof sizeChecked !== 'undefined') return sizeChecked

    const extensionChecked = checkExtension(file)
    if (typeof extensionChecked !== 'undefined') return extensionChecked

    const userChecked = checkUser(self, file, 'upload')
    if (typeof userChecked !== 'undefined') return userChecked

    return true
  }
}

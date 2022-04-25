export const getBeforeUpload = ({ log = () => {}, checkSize = () => {}, checkExtension = () => {}, checkUser = () => {} }) => {
  return function beforeUpload (file) {
    log('before upload')
    const self = this

    const sizeChecked = checkSize(file)
    if (typeof sizeChecked !== 'undefined') {
      log({ sizeChecked })
      return sizeChecked
    }

    const extensionChecked = checkExtension(file)
    if (typeof extensionChecked !== 'undefined') {
      log({ extensionChecked })
      return extensionChecked
    }

    const userChecked = checkUser(self, file, 'upload')
    if (typeof userChecked !== 'undefined') {
      log({ extensionChecked })
      return userChecked
    }

    // update file's information on being processed
    return true
  }
}

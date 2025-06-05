export const getBeforeUpload = ({ log = () => {}, checkSize = () => {}, checkExtension = () => {}, checkUser = () => {} }) => {
  return async function beforeUpload (file) {
    log('before upload')
    const self = this

    const sizeChecked = await checkSize(file)
    if (typeof sizeChecked !== 'undefined') {
      log({ sizeChecked })
      return sizeChecked
    }

    const extensionChecked = await checkExtension(file)
    if (typeof extensionChecked !== 'undefined') {
      log({ extensionChecked })
      return extensionChecked
    }

    const userChecked = await checkUser(self, file, 'upload')
    if (typeof userChecked !== 'undefined') {
      log({ extensionChecked })
      return userChecked
    }

    // update file's information on being processed
    return true
  }
}

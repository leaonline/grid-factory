import { Meteor } from 'meteor/meteor'
import { FilesCollection } from 'meteor/ostrio:files'

export const createFilesCollectionFactory = ({ i18nFactory, debug }) => {
  return ({ maxSize, extensions, validateUser, ...config }) => {
    const maxSizeKb = maxSize / 1024000
    const checkSize = (file) => {
      if (maxSize && file.size > maxSize) {
        return i18nFactory('filesCollection.maxSizeExceed', { maxSize: maxSizeKb })
      }
    }

    const allowedExtensions = extensions && extensions.join(', ')
    const checkExtension = (file) => {
      if (extensions && !extensions.includes(file.extension)) {
        return i18nFactory('filesCollection.invalidExtension', { allowed: allowedExtensions })
      }
    }

    const checkUser = validateUser
      ? (context) => {
        const user = context.user()
        if (!validateUser(user)) {
          return i18nFactory('filesCollection.permissionDenied')
        }
      }
      : () => {}

    function beforeUpload (file) {
      const self = this

      const sizeChecked = checkSize(file)
      if (typeof sizeChecked !== 'undefined') return sizeChecked

      const extensionChecked = checkExtension(file)
      if (typeof extensionChecked !== 'undefined') return extensionChecked

      const userChecked = checkUser(self)
      if (typeof userChecked !== 'undefined') return userChecked

      return true
    }

    const productConfig = Object.assign({
      debug: Meteor.isDevelopment && debug,
      onbeforeunloadMessage: Meteor.isClient && (() => i18nFactory('filesCollection.onbeforeunloadMessage')),
      onBeforeUpload: beforeUpload,
      allowClientCode: false // Disallow remove files from Client
    }, config)

    return new FilesCollection(productConfig)
  }
}

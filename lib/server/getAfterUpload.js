export const getAfterUpload = ({ onErrorHook, validateMime, transformVersions, moveToGrid, i18nFactory, log }) => {
  const handleAfterUpload = async function handleAfterUpload (file) {
    log('after upload')
    const self = this
    const Collection = self.collection

    // this function passes any occurring error to the onError hook
    // and also unlinks the file from the FS, because we can't be sure
    // if it's still valid to continue to work with it.
    const handleErr = err => {
      onErrorHook(err)
      self.unlink(Collection.findOne(file._id)) // Unlink files from FS
      log(`${file._id} unlinked`)
    }

    const callOptions = {
      translate: i18nFactory,
      log: log
    }

    try {
      // mime validation is optional and also needs to catch exceptions
      if (validateMime) {
        log('validate mime')
        await validateMime.call(self, file, callOptions)
      }

      // here you could manipulate your file
      // and create a new version, for example a scaled 'thumbnail'
      if (transformVersions) {
        log('transformVersions')
        Promise.await(transformVersions.call(self, file, callOptions))

      }

      // finally move all file versions to GridFS
      moveToGrid(file, Collection, self, handleErr)
    } catch (mimeErr) {
      handleErr(mimeErr)
    }

    return true
  }

  return function (file) {
    handleAfterUpload.call(this, file)
      .then(() => log('all upload complete'))
      .catch(e => console.error(e))
  }
}

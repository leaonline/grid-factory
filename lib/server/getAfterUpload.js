export const getAfterUpload = ({ onErrorHook, validateMime, transformVersions, moveToGrid, log }) => function afterUpload (file) {
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

  // mime validation is optional and also needs to catch exceptions
  if (validateMime) {
    log('validate mime')
    try {
      Promise.await(validateMime.call(self, file))
    } catch (mimeErr) {
      handleErr(mimeErr)
    }
  }

  // here you could manipulate your file
  // and create a new version, for example a scaled 'thumbnail'
  if (transformVersions) {
    log('transformVersions')
    try {
      Promise.await(transformVersions.call(self, file))
    } catch (transformErr) {
      return handleErr(transformErr)
    }
  }

  // finally move all file versions to GridFS
  moveToGrid(file, Collection, self, handleErr)
  return true
}
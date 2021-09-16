import { check, Match } from 'meteor/check'

const maybeFunction = Match.Maybe(Function)

/**
 *
 * @param onErrorHook {Function|undefined} used to bubble up errors
 * @param validateMime {Function|undefined} custom mime validation
 * @param transformVersions {Function|undefined} custom file transform / convert
 * @param moveToGrid {Function|undefined} moves file to gridFS
 * @param i18nFactory {Function|undefined} handles translation
 * @param log {Function|undefined} logs to wherever
 * @param debug {boolean|undefined} extra verbose logs
 * @return {function(file): Promise<Boolean>} the onAfterUpload function
 */

export const getAfterUpload = ({ onErrorHook, validateMime, transformVersions, moveToGrid, i18nFactory, log, debug }) => {
  check(onErrorHook, maybeFunction)
  check(validateMime, maybeFunction)
  check(transformVersions, maybeFunction)
  check(moveToGrid, maybeFunction)
  check(i18nFactory, maybeFunction)
  check(log, maybeFunction)

  /**
   * The onAfterUpload handler that is passed to the FilesCollection constructor
   *
   * @param file {document} the current upload's related file document
   * @return {boolean} true if successful, false if any error occurred
   */
  return async function onAfterUpload (file) {
    if (debug) log('onAfterUpload()')
    const self = this
    const Collection = self.collection

    let hasError = false

    // this function passes any occurring error to the onError hook
    // and also unlinks the file from the FS, because we can't be sure
    // if it's still valid to continue to work with it.
    // Note: we need to remove all potential versions, since transformVersions
    // could create new temporary files, like thumbnails and in any error case
    // we need to rather remove them all and let the user restart fresh, than
    // keeping a few by complex rules.
    const handleErr = err => {
      hasError = true
      self.unlink(Collection.findOne(file._id)) // Unlink files from FS
      self.remove(file._id)
      log(`${file._id} unlinked due to error`)

      if (onErrorHook) {
        onErrorHook(err)
      }
    }

    const callOptions = {
      translate: i18nFactory,
      log: log,
      debug: debug
    }

    try {
      // mime validation is optional and also needs to catch exceptions
      if (validateMime) {
        if (debug) log('validateMime()')
        await validateMime.call(self, file, callOptions)
      }

      // here you could manipulate your file
      // and create a new version, for example a scaled 'thumbnail'
      if (transformVersions) {
        if (debug) log('transformVersions()')
        await transformVersions.call(self, file, callOptions)
      }

      // finally move all file versions to GridFS
      if (moveToGrid) {
        if (debug) log('moveToGrid()')
        await moveToGrid(file, Collection, self)
      }

      if (debug) log('update file')
      await Collection.update(file._id, {
        $set: { processingComplete: true }
      })
    } catch (afterUploadError) {
      console.error(afterUploadError)
      handleErr(afterUploadError)
    }

    return !hasError
  }
}

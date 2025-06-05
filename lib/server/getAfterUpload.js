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
 * @return {function(file): Promise<Boolean>} the onAfterUpload function
 */

export const getAfterUpload = ({
  onErrorHook,
  validateMime,
  transformVersions,
  moveToGrid,
  i18nFactory,
  log = () => {},
}) => {
  check(onErrorHook, maybeFunction)
  check(validateMime, maybeFunction)
  check(transformVersions, maybeFunction)
  check(moveToGrid, maybeFunction)
  check(i18nFactory, maybeFunction)
  check(log, Function)

  /**
   * The onAfterUpload handler that is passed to the FilesCollection constructor
   *
   * @param file {document} the current upload's related file document
   * @return {boolean} true if successful, false if any error occurred
   */
  return async function onAfterUpload(file) {
    log('onAfterUpload()')
    const fileId = file._id
    const Collection = this.collection

    let hasError = false

    // this function passes any occurring error to the onError hook
    // and also unlinks the file from the FS, because we can't be sure
    // if it's still valid to continue to work with it.
    // Note: we need to remove all potential versions, since transformVersions
    // could create new temporary files, like thumbnails and in any error case
    // we need to rather remove them all and let the user restart fresh, than
    // keeping a few by complex rules.
    const handleErr = async (err) => {
      log('an error occurred', err?.message)
      hasError = true
      /* eslint-disable-next-line security/detect-non-literal-fs-filename -- Safe as no value holds user input */
      const fileToUnlink = await Collection.findOneAsync(fileId)
      await this.unlinkAsync(fileToUnlink) // Unlink files from FS
      await this.removeAsync(fileId)
      log(`${fileId} forcefully unlinked due to error`)

      if (onErrorHook) {
        onErrorHook(err)
      }
    }

    const callOptions = {
      translate: i18nFactory,
      log: log,
    }

    try {
      // mime validation is optional and also needs to catch exceptions
      if (validateMime) {
        log('validateMime()')
        await validateMime.call(this, file, callOptions)
      } else {
        log('skip validateMime(')
      }

      // here you could manipulate your file
      // and create a new version, for example a scaled 'thumbnail'
      if (transformVersions) {
        log('transformVersions()')
        await transformVersions.call(this, file, callOptions)
      } else {
        log('skip transformVersions(')
      }

      // finally move all file versions to GridFS
      if (moveToGrid) {
        log('moveToGrid()')
        await moveToGrid(file, Collection, this)
      } else {
        log('skip moveToGrid(')
      }

      log('set processingComplete to true')
      await Collection.updateAsync(fileId, {
        $set: { processingComplete: true },
      })
    } catch (afterUploadError) {
      await handleErr(afterUploadError)
    }

    return !hasError
  }
}

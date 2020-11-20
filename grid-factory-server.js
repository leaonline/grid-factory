import { check, Match } from 'meteor/check'
import { FilesCollection } from 'meteor/ostrio:files'
import { getLog } from './lib/both/getLog'
import { getCheckSize } from './lib/both/getCheckSize'
import { getCheckExtension } from './lib/both/getCheckExtension'
import { getCheckUser } from './lib/both/getCheckUser'
import { getBeforeUpload } from './lib/both/getBeforeUpload'
import { getOnProtected } from './lib/server/getOnProtected'
import { getMoveToGrid } from './lib/server/getMoveToGrid'
import { getBeforeRemove } from './lib/server/getBeforeRemove'
import { getAfterRemove } from './lib/server/getAfterRemove'
import { getAfterUpload } from './lib/server/getAfterUpload'
import { getInterceptDownload } from './lib/server/getInterceptDownload'

/**
 * Craetes a new factory function to create GridFS-backed FilesCollections.
 * @param i18nFactory {Function} a Function that gets an i18n id + options and may return a translated String
 * @param fs The node file system, injectable for convenience reasons (testing, package deps etc.)
 * @param bucketFactory {Function} A function that returns a valid GridFS bucket by name
 * @param defaultBucket {String} A name for the defaultBucket.
 * @param createObjectId {Function} A function that transform a gridfs id to a valid ObjectId
 * @param onError {Function} A function that receives an error, if any occurred
 * @param debug {Boolean} A flag used to log debug messages to the console
 * @return {function({bucketName?: *, maxSize?: *, extensions?: *, validateUser?: *, validateMime?: *, transformVersions?: *, config?: *}): FilesCollection} Factory Function
 */
export const createGridFilesFactory = ({ i18nFactory, fs, bucketFactory, defaultBucket, createObjectId, onError, debug }) => {
  check(i18nFactory, Function)
  check(fs, Object)
  check(bucketFactory, Function)
  check(defaultBucket, String)
  check(createObjectId, Function)
  check(onError, Match.Maybe(Function))
  check(debug, Match.Maybe(Boolean))

  const abstractDebug = debug
  const abstractOnError = onError || (e => console.error(e))
  const abstractLog = getLog(abstractDebug)
  /**
   *
   * @param bucketName
   * @param maxSize
   * @param extensions
   * @param validateUser
   * @param validateMime
   * @param transformVersions
   * @param onError {Function} A function that receives an error, if any occurred, overrides onError from the abstract level
   * @param config override any parameteor for the original FilesCollection constructor
   * @return {FilesCollection}
   */
  const factory = ({ bucketName, maxSize, extensions, validateUser, validateMime, transformVersions, onError, debug, ...config }) => {
    check(bucketName, Match.Maybe(String))
    check(maxSize, Match.Maybe(Number))
    check(debug, Match.Maybe(Boolean))
    check(validateUser, Match.Maybe(Function))

    const factoryDebug = debug || abstractDebug
    const log = getLog(factoryDebug)

    log(`create files collection [${config.collectionName || config?.collection?._name}]`)
    log(`use bucket [${bucketName || defaultBucket}]`)
    log(`use mime validation [${!!validateMime}]`)
    log(`use transform [${!!transformVersions}]`)

    const onErrorHook = onError || abstractOnError
    const bucket = bucketFactory(bucketName || defaultBucket)

    // checks
    const checkSize = getCheckSize({ maxSize, i18nFactory, log })
    const checkExtension = getCheckExtension({ extensions, i18nFactory, log })
    const checkUser = getCheckUser({ validateUser, i18nFactory, log, onErrorHook })

    // upload
    const beforeUpload = getBeforeUpload({ checkSize, checkExtension, checkUser, log })
    const moveToGrid = getMoveToGrid({ bucket, fs, log })
    const afterUpload = getAfterUpload({ validateMime, transformVersions, moveToGrid, log, onErrorHook })

    // download
    const onProtected = getOnProtected({ checkUser })
    const interceptDownload = getInterceptDownload({ bucket, createObjectId, onErrorHook, log })

    // remove
    const beforeRemove = getBeforeRemove({ checkUser })
    const afterRemove = getAfterRemove({ bucket, createObjectId, onErrorHook })

    const productConfig = Object.assign({
      debug: factoryDebug,
      onBeforeUpload: beforeUpload,
      onAfterUpload: afterUpload,
      allowClientCode: false, // Disallow remove files from Client
      interceptDownload: interceptDownload,
      onBeforeRemove: beforeRemove,
      onAfterRemove: afterRemove,
      protected: onProtected
    }, config)

    return new FilesCollection(productConfig)
  }

  abstractLog(`factory created for default bucket [${defaultBucket}]`)

  return factory
}

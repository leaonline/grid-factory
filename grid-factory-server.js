import { check, Match } from 'meteor/check'
import { FilesCollection } from 'meteor/ostrio:files'
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
import { getDefaultBucket } from './lib/utils/getDefaultBucket'
import { getDefaultGridFsFileId } from './lib/utils/getDefaultGridFsFileId'
import { noop } from './lib/utils/noop'

/**
 * Creates a new factory function to create GridFS-backed FilesCollections.
 * @param i18nFactory {Function} a Function that gets an i18n id + options and may return a translated String
 * @param fs The node file system, injectable for convenience reasons (testing, package deps, dropin replacements etc.)
 * @param bucketFactory {Function} A function that returns a valid GridFS bucket by name
 * @param defaultBucket {String} A name for the defaultBucket.
 * @param createObjectId {Function} A function that transform a gridfs id to a valid ObjectId
 * @param onError {Function} A function that receives an error, if any occurred
 * @param debug {Function} function to pass debug logs to
 * @return {function(options): FilesCollection} Factory Function
 */
export const createGridFilesFactory = ({
  i18nFactory = (x) => x,
  fs = require('node:fs'),
  bucketFactory,
  defaultBucket,
  createObjectId,
  onError,
  debug: abstractLog = noop,
} = {}) => {
  check(i18nFactory, Function)
  check(fs, Match.ObjectIncluding({ createReadStream: Function }))
  check(bucketFactory, Match.Maybe(Function))
  check(defaultBucket, Match.Maybe(String))
  check(createObjectId, Match.Maybe(Function))
  check(onError, Match.Maybe(Function))
  check(abstractLog, Match.Maybe(Function))

  const abstractOnError = onError || ((e) => console.error(e))
  const abstractBucketFactory = bucketFactory || getDefaultBucket
  const abstractCreateObjectId = createObjectId || getDefaultGridFsFileId
  /**
   *
   * @param bucketName
   * @param maxSize
   * @param extensions
   * @param validateUser
   * @param validateMime
   * @param transformVersions
   * @param usePartialResponse
   * @param onError {Function} A function that receives an error, if any occurred, overrides onError from the abstract level
   * @param config override any parameteor for the original FilesCollection constructor
   * @param debug {Function} debug function for extended logging
   * @return {FilesCollection}
   */
  const factory = ({
    bucketName,
    maxSize,
    extensions,
    validateUser,
    validateMime,
    transformVersions,
    usePartialResponse,
    onError,
    debug: log = noop,
    ...config
  }) => {
    console.debug(typeof abstractLog, typeof log)
    check(bucketName, Match.Maybe(String))
    check(maxSize, Match.Maybe(Number))
    check(log, Match.Maybe(Function))
    check(validateUser, Match.Maybe(Function))
    check(validateMime, Match.Maybe(Function))
    check(usePartialResponse, Match.Maybe(Boolean))
    check(transformVersions, Match.Maybe(Function))
    check(onError, Match.Maybe(Function))

    log(
      `create files collection [${config.collectionName || config?.collection?._name}]`,
    )
    log(`use bucket [${bucketName || defaultBucket || 'files'}]`)
    log(`use mime validation [${!!validateMime}]`)
    log(`use transform [${!!transformVersions}]`)

    const onErrorHook = onError || abstractOnError
    const bucket = abstractBucketFactory(bucketName || defaultBucket || 'files')

    // checks
    const checkSize = getCheckSize({ maxSize, i18nFactory, log })
    const checkExtension = getCheckExtension({ extensions, i18nFactory, log })
    const checkUser = getCheckUser({
      validateUser,
      i18nFactory,
      log,
      onErrorHook,
    })

    // upload
    const beforeUpload = getBeforeUpload({
      checkSize,
      checkExtension,
      checkUser,
      log,
    })
    const onInitiateUpload = async (fileData) => {
      log('onInitiateUpload()')
      fileData.processingComplete = false
    }
    const moveToGrid = getMoveToGrid({ bucket, fs, log })
    const afterUpload = getAfterUpload({
      validateMime,
      transformVersions,
      moveToGrid,
      log,
      onErrorHook,
    })

    // download
    const onProtected = getOnProtected({ checkUser })
    const interceptDownload = getInterceptDownload({
      bucket,
      createObjectId: abstractCreateObjectId,
      onErrorHook,
      usePartialResponse,
      log,
    })

    // remove
    const beforeRemove = getBeforeRemove({ checkUser, log })
    const afterRemove = getAfterRemove({
      bucket,
      createObjectId: abstractCreateObjectId,
      onErrorHook,
    })

    const productConfig = Object.assign(
      {
        debug: !!(log || abstractLog),
        onBeforeUpload: beforeUpload,
        onInitiateUpload: onInitiateUpload,
        onAfterUpload: afterUpload,
        allowClientCode: false, // Disallow remove files from Client
        interceptDownload: interceptDownload,
        onBeforeRemove: beforeRemove,
        onAfterRemove: afterRemove,
        protected: onProtected,
      },
      config,
    )

    return new FilesCollection(productConfig)
  }

  abstractLog(`factory created for default bucket [${defaultBucket}]`)

  return factory
}

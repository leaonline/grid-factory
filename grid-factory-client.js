import { Meteor } from 'meteor/meteor'
import { check, Match } from 'meteor/check'
import { FilesCollection } from 'meteor/ostrio:files'
import { getBeforeUpload } from './lib/both/getBeforeUpload'
import { getLog } from './lib/both/getLog'
import { getCheckSize } from './lib/both/getCheckSize'
import { getCheckExtension } from './lib/both/getCheckExtension'
import { getCheckUser } from './lib/both/getCheckUser'

/**
 * High level abstract factory to create FilesCollection-factories with
 * built-in GridFS storage. Options passed to this method apply to all
 * instances, created with factories (but may be overridden by the concrete
 * factories options).
 *
 * @param abstractOptions.i18nFactory {Function?} a function resolving an i18n string
 * @param abstractOptions.onError {Function?} function to handle/pipe errors
 * @param abstractOptions.debug {Boolean} flag to run internal debug logs
 *
 * @return {function(options): FilesCollection}
 */
export const createGridFilesFactory = (abstractOptions = {}) => {
  check(abstractOptions, Match.ObjectIncluding(abstractOptionsDef))

  const { i18nFactory, onError, debug } = abstractOptions
  const abstractOnError = onError || (e => console.error(e))
  const abstractLevelDebug = debug

  /**
   * A factory function to create new FilesCollection instances.
   * @param options.maxSize
   * @param options.extensions
   * @param options.validateUser
   * @param options.onError
   * @param options.debug
   * @param options.config
   * @return {FilesCollection}
   */
  const factoryFunction = (options = {}) => {
    const { maxSize, extensions, validateUser, onError, debug, ...config } = options
    const factoryLevelDebug = debug || abstractLevelDebug
    const log = getLog(factoryLevelDebug)
    log(`create files collection [${config.collectionName || config?.collection?._name}]`)

    const onErrorHook = onError || abstractOnError
    const checkSize = getCheckSize({ i18nFactory, maxSize, log })
    const checkExtension = getCheckExtension({ i18nFactory, extensions, log })
    const checkUser = getCheckUser({ log, i18nFactory, validateUser, onErrorHook })
    const beforeUpload = getBeforeUpload({ log, checkUser, checkSize, checkExtension })

    const factoryConfig = {
      debug: factoryLevelDebug,
      onbeforeunloadMessage: Meteor.isClient && (() => i18nFactory('filesCollection.onbeforeunloadMessage')),
      onBeforeUpload: beforeUpload,
      allowClientCode: false // Disallow remove files from Client
    }

    const productConfig = Object.assign(factoryConfig, config)

    return new FilesCollection(productConfig)
  }

  return factoryFunction
}

// INTERNAL

const abstractOptionsDef = {
  i18nFactory: Match.Maybe(Function),
  onError: Match.Maybe(Function),
  debug: Match.Maybe(Boolean)
}

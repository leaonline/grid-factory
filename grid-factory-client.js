import { Meteor } from 'meteor/meteor'
import { FilesCollection } from 'meteor/ostrio:files'
import { getBeforeUpload } from './lib/both/getBeforeUpload'
import { getLog } from './lib/both/getLog'
import { getCheckSize } from './lib/both/getCheckSize'
import { getCheckExtension } from './lib/both/getCheckExtension'
import { getCheckUser } from './lib/both/getCheckUser'

export const createGridFilesFactory = ({ i18nFactory, onError, debug }) => {
  const abstractOnError = onError || (e => console.error(e))
  const abstractLevelDebug = debug

  return ({ maxSize, extensions, validateUser, onError, debug, ...config }) => {
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
}

import { getProp } from '../utils/getProp'

/**
 * Returns the {gridFsFileId} by a given version.
 * If the version has no {gridFsFileId} it will try to get it from any version it can find.
 *
 * @param versions the versions Object of the file object
 * @param log
 * @param name the name of the targeted version
 */
export const getGridFsFileId = (versions = {}, name, log = () => {}) => {
  const target = getProp(versions, name)

  // in a perfect world we have the gridFsFileId attached to the file.meta
  if (target?.meta?.gridFsFileId) {
    return target.meta.gridFsFileId
  }

  // if not, let's search for a version that has a valid gridFsFileId
  const fallbackVersion = Object.entries(versions).find(([versionName, version]) => {
    if (version?.meta?.gridFsFileId) {
      log(`fallback to version [${versionName}]`)
      return version
    }

    return undefined
  })

  return fallbackVersion?.[1]?.meta?.gridFsFileId
}

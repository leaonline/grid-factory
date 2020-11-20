/**
 * Returns the {gridFsFileId} by a given version.
 * If the version has no {gridFsFileId} it will try to get it from any version it can find.
 *
 * @param versions the versions Object of the file object
 * @param name the name of the targeted version
 */
export const getGridFsFileId = (versions = {}, name, log) => {
  const target = versions[name]
  if (target?.meta?.gridFsFileId) {
    return target.meta.gridFsFileId
  }

  // if not found, let's search for a version that has a valid id
  const fallbackVersion = Object.entries(versions).find(([versionName, version]) => {
    if (version?.meta?.gridFsFileId) {
      log(`fallback to version [${versionName}]`)
      return version
    }
  })

  return fallbackVersion?.[1]?.meta?.gridFsFileId
}

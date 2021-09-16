/**
 * Removes all remaining versions from GridFS
 * @param bucket {Object}
 * @param createObjectId {Function}
 * @param onErrorHook {Function}
 * @return {function([file]):void}
 */

export const getAfterRemove = ({ bucket, createObjectId, onErrorHook }) => function afterRemove (removedFiles) {
  removedFiles.forEach(file => {
    Object.keys(file.versions || {}).forEach(versionName => {
      const gridFsFileId = (file.versions[versionName].meta || {}).gridFsFileId
      if (gridFsFileId) {
        const gfsId = createObjectId({ gridFsFileId })
        bucket.delete(gfsId, onErrorHook)
      }
    })
  })
}

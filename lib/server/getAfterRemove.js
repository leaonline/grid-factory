/**
 * Removes all remaining versions from GridFS
 * @param bucket {object} the gridFSBucket
 * @param createObjectId {Function} factory function to create native ObjectIDs
 * @param onErrorHook {Function} used as callback in case the removal fails
 * @return {function([file]):void}
 */

export const getAfterRemove = ({ bucket, createObjectId, onErrorHook }) => function afterRemove (removedFiles) {
  removedFiles.forEach(file => {
    Object.values(file.versions || {}).forEach((version = {}) => {
      const gridFsFileId = (version.meta || {}).gridFsFileId

      if (gridFsFileId) {
        const gfsId = createObjectId({ gridFsFileId })
        bucket.delete(gfsId, onErrorHook)
      }
    })
  })
}

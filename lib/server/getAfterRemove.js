export const getAfterRemove = ({ bucket, createObjectId, onErrorHook }) => function afterRemove (files) {
  files.forEach(file => {
    Object.keys(file.versions).forEach(versionName => {
      const gridFsFileId = (file.versions[versionName].meta || {}).gridFsFileId
      if (gridFsFileId) {
        const gfsId = createObjectId({ gridFsFileId })
        bucket.delete(gfsId, onErrorHook)
      }
    })
  })
}

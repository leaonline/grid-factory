import { Meteor } from 'meteor/meteor'

/**
 *
 * @param bucket
 * @param fs
 * @param log
 * @param debug
 * @return {Function}
 */
export const getMoveToGrid = ({ bucket, fs, log, debug }) => {
  /**
   *
   * @param file
   * @param Collection
   * @param filesCollection
   */

  return function moveToGrid (file, Collection, filesCollection) {
    log('move all versions to grid', file?.name)

    // then we read all versions we have got so far
    return Promise.all(
      Object.keys(file.versions).map(versionName => {
        return new Promise((resolve, reject) => {
          if (debug) log(`move ${file.name} (${versionName}) to bucket [${bucket}]`)

          const metadata = { ...file.meta, versionName, fileId: file._id }

          fs.createReadStream(file.versions[versionName].path)

          // this is where we upload the binaries to the GridFS
            .pipe(bucket.openUploadStream(file.name, {
              contentType: file.type || 'binary/octet-stream',
              metadata
            }))

            // we unlink the file from the fs on any error
            // that occurred during the upload to prevent zombie files.
            .on('error', error => {
              reject(error)
            })

            // once we are finished, we attach the gridFS Object id on the
            // FilesCollection document's meta section and finally unlink the
            // upload file from the filesystem
            .on('finish', Meteor.bindEnvironment(gridFile => {
              const property = `versions.${versionName}.meta.gridFsFileId`
              Collection.update(file._id, {
                $set: {
                  [property]: gridFile._id.toHexString()
                }
              })

              // Unlink files from FS
              filesCollection.unlink(Collection.findOne(file._id), versionName)
              resolve()
            }))
        })
      })
    )
  }
}

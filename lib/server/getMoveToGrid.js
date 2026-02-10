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

  return function moveToGrid(file, Collection, filesCollection) {
    log(`move all versions of ${file?.name} to gridFS`)
    const unlink = async (versionName) => {
      const fileVersion = await Collection.findOneAsync(file._id)
      await filesCollection.unlinkAsync(fileVersion, versionName)
    }

    // then we read all versions we have got so far
    const promises = Object.entries(file.versions || {}).map(
      ([versionName /* , version = {} */]) => {
        return new Promise((resolve, reject) => {
          log(
            `move ${file._id}/${file.name} (${versionName}) to bucket [${bucket.name}]`,
          )
          const metadata = { ...file.meta, versionName, fileId: file._id }
          const uploadOptions = { metadata, contentType: file.type }
          const uploadStream = bucket.openUploadStream(file.name, uploadOptions)
          const gridFileId = uploadStream.id.toHexString()
          log(
            `upload stream for ${file._id}/${file.name} (${versionName}) is ${gridFileId}`,
          )
          uploadStream.on('finish', async () => {
            log(
              `finish ${file._id}/${file.name} (${versionName}) in bucket [${bucket}]`,
            )
            log('save grid file', gridFileId)

            const property = `versions.${versionName}.meta.gridFsFileId`
            let failed = null
            try {
              await Collection.updateAsync(file._id, {
                $set: {
                  [property]: gridFileId,
                },
              })
            } catch (error) {
              log(error)
              failed = error
            } finally {
              log('cleanup', versionName)
              await unlink(versionName)
            }

            if (failed) {
              reject(failed)
            } else {
              resolve()
            }
          })

          const handleError = async (err) => {
            log(
              `failed ${file._id}/${file.name} (${versionName}) in bucket [${bucket}]`,
            )
            console.error(err)
            await unlink(versionName)
            reject(err)
          }

          uploadStream.on('error', handleError)

          const readStream = fs.createReadStream(
            file.versions[versionName].path,
          )
          readStream.on('open', () => readStream.pipe(uploadStream))
          readStream.on('error', async (err) => {
            uploadStream.close()
            await handleError(err)
          })
        })
      },
    )

    return Promise.all(promises)
  }
}

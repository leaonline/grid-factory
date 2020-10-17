import { Meteor } from 'meteor/meteor'

export const getMoveToGrid = ({ bucket, fs, log }) => {
  return function (file, Collection, filesCollection, handleErr) {
    // then we read all versions we have got so far
    Object.keys(file.versions).forEach(versionName => {
      log(`move ${file.name} (${versionName}) to bucket [${bucket}]`)
      const metadata = { ...file.meta, versionName, fileId: file._id }
      fs.createReadStream(file.versions[versionName].path)

      // this is where we upload the binary to the bucket
        .pipe(bucket.openUploadStream(file.name, { contentType: file.type || 'binary/octet-stream', metadata }))

        // and we unlink the file from the fs on any error
        // that occurred during the upload to prevent zombie files
        .on('error', handleErr)

        // once we are finished, we attach the gridFS Object id on the
        // FilesCollection document's meta section and finally unlink the
        // upload file from the filesystem
        .on('finish', Meteor.bindEnvironment(ver => {
          const property = `versions.${versionName}.meta.gridFsFileId`
          Collection.update(file._id, {
            $set: {
              [property]: ver._id.toHexString()
            }
          })

          filesCollection.unlink(Collection.findOne(file._id), versionName) // Unlink files from FS
        }))
    })
  }
}
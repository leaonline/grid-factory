import { Meteor } from 'meteor/meteor'
import { check } from 'meteor/check'
import { FilesCollection } from 'meteor/ostrio:files'

export const createFilesCollectionFactory = ({ i18nFactory, fs, bucketFactory, defaultBucket, createObjectId, debug }) => {
  check(i18nFactory, Function)
  check(fs, Object)
  check(bucketFactory, Function)
  check(defaultBucket, String)
  check(createObjectId, Function)
  check(debug, Match.Maybe(Boolean))

  return ({ bucketName, maxSize, extensions, validateUser, validateMime, onBeforeUpload, transformVersions, ...config }) => {
    check(bucketName, Match.Maybe(String))
    check(maxSize, Match.Maybe(Number))

    const bucket = bucketFactory(bucketName || defaultBucket)
    const maxSizeKb = maxSize && (maxSize / 1024000)

    const checkSize = (file) => {
      if (maxSize && file.size > maxSize) {
        return i18nFactory('filesCollection.maxSizeExceed', { maxSize: maxSizeKb })
      }
    }

    const allowedExtensions = extensions && extensions.join(', ')
    const checkExtension = (file) => {
      if (extensions && !extensions.includes(file.extension)) {
        return i18nFactory('filesCollection.invalidExtension', { allowed: allowedExtensions })
      }
    }

    const checkUser = (context) => {
      const user = context.user()
      if (validateUser && !validateUser(user)) {
        return i18nFactory('filesCollection.permissionDenied')
      }
    }

    function beforeUpload (file) {
      const self = this

      const sizeChecked = checkSize(file)
      if (typeof sizeChecked !== 'undefined') return sizeChecked

      const extensionChecked = checkExtension(file)
      if (typeof extensionChecked !== 'undefined') return extensionChecked

      const userChecked = checkUser(self)
      if (typeof userChecked !== 'undefined') return userChecked

      const customCheck = onBeforeUpload && onBeforeUpload.call(self, file)
      if (typeof customCheck !== 'undefined') return customCheck

      return true
    }

    function beforeRemove () {
      const self = this
      const userChecked = checkUser(self)
      return typeof userChecked === 'undefined'
    }

    function afterUpload (file) {
      const self = this
      const Collection = self.collection
      const handleErr = err => {
        console.error(err)
        self.unlink(Collection.findOne(file._id)) // Unlink files from FS
      }

      const userChecked = checkUser(self)
      if (typeof userChecked === 'undefined') {
        return handleErr(new Error(userChecked))
      }

      if (validateMime) {
        try {
          Promise.await(validateMime.call(self, file))
        } catch (mimeErr) {
          handleErr(mimeErr)
        }
      }

      // here you could manipulate your file
      // and create a new version, for example a scaled 'thumbnail'
      if (transformVersions) {
        try {
          Promise.await(transformVersions.call(self, file))
        } catch (transformErr) {
          return handleErr(transformErr)
        }
      }

      // then we read all versions we have got so far
      Object.keys(file.versions).forEach(versionName => {
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
            self.unlink(Collection.findOne(file._id), versionName) // Unlink files from FS
          }))
      })
    }

    function interceptDownload (http, file, versionName) {
      const self = this
      const { gridFsFileId } = file.versions[versionName].meta || {}
      if (gridFsFileId) {
        const gfsId = createObjectId({ gridFsFileId })
        const readStream = bucket.openDownloadStream(gfsId)
        readStream.on('data', (data) => {
          http.response.write(data)
        })

        readStream.on('end', () => {
          http.response.end('end')
        })

        readStream.on('error', () => {
          // not found probably
          // eslint-disable-next-line no-param-reassign
          http.response.statusCode = 404
          http.response.end('not found')
        })

        http.response.setHeader('Cache-Control', self.cacheControl)
        http.response.setHeader('Content-Disposition', `inline; filename="${file.name}"`)
      }
      return Boolean(gridFsFileId) // Serve file from either GridFS or FS if it wasn't uploaded yet
    }

    function afterRemove (files) {
      files.forEach(file => {
        Object.keys(file.versions).forEach(versionName => {
          const gridFsFileId = (file.versions[versionName].meta || {}).gridFsFileId
          if (gridFsFileId) {
            const gfsId = createObjectId({ gridFsFileId })
            bucket.delete(gfsId, err => { if (err) console.error(err) })
          }
        })
      })
    }

    const productConfig = Object.assign({
      debug: Meteor.isDevelopment && debug,
      onBeforeUpload: beforeUpload,
      onAfterUpload: Meteor.isServer && afterUpload,
      allowClientCode: false, // Disallow remove files from Client
      interceptDownload: Meteor.isServer && interceptDownload,
      onBeforeRemove: Meteor.isServer && beforeRemove,
      onAfterRemove: afterRemove
    }, config)

    return new FilesCollection(config)
  }
}

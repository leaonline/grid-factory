import { getGridFsFileId } from './getGridFsFileId'
import { getContentDisposition } from './getContentDisposition'

export const getInterceptDownload = ({ bucket, createObjectId, onErrorHook, log }) => function interceptDownload (http, file, versionName = 'original') {
  const self = this
  log('interceptDownload', file.name, versionName)

  const gridFsFileId = getGridFsFileId(file.versions, versionName)
  if (!gridFsFileId) {
    log('could not get gridFsFileId from ANY version')
    return false
  }

  const gfsId = createObjectId({ gridFsFileId })
  const readStream = bucket.openDownloadStream(gfsId)
  readStream.on('data', (data) => {
    http.response.write(data)
  })

  readStream.on('end', () => {
    http.response.end()
  })

  readStream.on('error', err => {
    onErrorHook(err)
    // not found probably
    // eslint-disable-next-line no-param-reassign
    http.response.statusCode = 404
    http.response.end('not found')
  })

  http.response.setHeader('Cache-Control', self.cacheControl)
  http.response.setHeader('Content-Disposition', getContentDisposition(file.name, http?.params?.query?.download))
  return true
}
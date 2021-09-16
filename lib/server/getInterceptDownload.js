import { getGridFsFileId } from './getGridFsFileId'
import { getContentDisposition } from './getContentDisposition'

const partialSize = 261120 // 1024 * 255

export const getInterceptDownload = ({ bucket, createObjectId, onErrorHook, usePartialResponse, log }) => {
  log('getInterceptDownload', { usePartialResponse })

  if (usePartialResponse) {
    return function interceptDownloadPartial (http, file, versionName = 'original') {
      const self = this
      log('interceptDownload', file.name, versionName)

      const gridFsFileId = getGridFsFileId(file.versions, versionName, log)
      if (!gridFsFileId) {
        log('could not get gridFsFileId from ANY version')
        log(file.versions)
        return false
      }

      const vRef = Object.values(file.versions || {}).find(v => v?.meta?.gridFsFileId === gridFsFileId)

      let partial = false
      let array
      let start
      let end
      let rangeSize
      let streamRange
      let responseType = '200'

      if (http.request.headers.range) {
        partial = true
        array = http.request.headers.range.split(/bytes=([0-9]*)-([0-9]*)/)
        start = Number.parseInt(array[1])
        end = Number.parseInt(array[2])

        if (Number.isNaN(end)) {
          end = vRef.size - 1 < partialSize
            ? vRef.size - 1
            : start + partialSize
        }
        rangeSize = end - start
      } else {
        start = 0
        end = vRef.size - 1
        rangeSize = vRef.size
      }

      if (partial || (http?.params?.query?.play === 'true')) {
        streamRange = {
          start: start,
          end: end
        }

        if (isNaN(start) && !isNaN(end)) {
          streamRange.start = end - rangeSize
          streamRange.end = end
        }
        if (!isNaN(start) && isNaN(end)) {
          streamRange.start = start
          streamRange.end = start + rangeSize
        }
        if ((start + rangeSize) >= vRef.size) {
          streamRange.end = vRef.size - 1
        }
        if (self.strict && (streamRange.start >= (vRef.size - 1) || streamRange.end > (vRef.size - 1))) {
          responseType = '416'
        } else {
          responseType = '206'
        }
      }

      const streamErrorHandler = function (error) {
        log('[serve(' + vRef.path + ', ' + versionName + ')] [500]', error)
        http.response.writeHead(500)
        http.response.end(error.toString())
      }

      if (responseType === '400') {
        log('[serve(' + vRef.path + ', ' + versionName + ')] [400] Content-Length mismatch!')
        const text = 'Content-Length mismatch!'
        http.response.writeHead(400, {
          'Content-Type': 'text/plain',
          'Content-Length': text.length
        })
        http.response.end(text)
      } else if (responseType === '416') {
        log('[serve(' + vRef.path + ', ' + versionName + ')] [416] Content-Range is not specified!')
        http.response.writeHead(416)
        http.response.end()
      } else if (responseType === '206') {
        const contentRange = 'bytes ' + streamRange.start + '-' + streamRange.end + '/' + vRef.size
        log('[serve(' + vRef.path + ', ' + versionName + ')] [206]', contentRange, rangeSize, streamRange.end - streamRange.start)

        // set content range

        const objectId = createObjectId({ gridFsFileId })
        const readStream = bucket.openDownloadStream(objectId, streamRange)

        http.response.setHeader('Content-Range', contentRange)
        http.response.setHeader('Cache-Control', 'no-store')
        http.response.setHeader('Content-Disposition', getContentDisposition(file.name, http?.params?.query?.download))

        let ended = false

        readStream
          .on('error', streamErrorHandler)
          .on('open', function () {
            if (!ended) http.response.writeHead(206)
          })
          .on('file', function (...args) {
            if (!ended) http.response.writeHead(206)
          })
          .on('close', function (...args) {
            ended = true
            http.response.end()
          })
          // .on('data', function(data) {
          //   console.debug('data', data.length)
          //   if (!ended) http.response.write(data)
          // })
          .on('end', function (...args) {
            ended = true
            http.response.end()
          })
          .pipe(http.response)
      } else if (responseType === '200') {
        log('[serve(' + vRef.path + ', ' + versionName + ')] [200]')

        const objectId = createObjectId({ gridFsFileId })
        const readStream = bucket.openDownloadStream(objectId)

        http.response.setHeader('Cache-Control', self.cacheControl)
        http.response.setHeader('Content-Disposition', getContentDisposition(file.name, http?.params?.query?.download))

        readStream.on('error', streamErrorHandler)

        readStream.on('data', (data) => {
          http.response.write(data)
        })

        readStream.on('end', () => {
          http.response.end()
        })
      } else {
        streamErrorHandler(new Error(`Unexpected response type [${responseType}]`))
      }

      return true
    }
  }

  return function interceptDownload (http, file, versionName = 'original') {
    const self = this
    log('interceptDownload', file.name, versionName)

    const gridFsFileId = getGridFsFileId(file.versions, versionName, log)
    if (!gridFsFileId) {
      log('could not get gridFsFileId from ANY version')
      log(file.versions)
      return false
    }

    log(gridFsFileId)
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
}

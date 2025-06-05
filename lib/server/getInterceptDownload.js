import { getGridFsFileId } from './getGridFsFileId'
import { getContentDisposition } from './getContentDisposition'

const partialSize = 261120 // 1024 * 255

export const getInterceptDownload = ({
  bucket,
  createObjectId,
  onErrorHook,
  usePartialResponse,
  log,
}) => {
  log('getInterceptDownload', { usePartialResponse })

  if (usePartialResponse) {
    return function interceptDownloadPartial(
      http,
      file,
      versionName = 'original',
    ) {
      log('interceptDownloadPartial', file.name, versionName)

      const gridFsFileId = getGridFsFileId(file.versions, versionName, log)
      if (!gridFsFileId) {
        log('could not get gridFsFileId from ANY version')
        log(file.versions)
        return false
      }

      const vRef = Object.values(file.versions || {}).find(
        (v) => v?.meta?.gridFsFileId === gridFsFileId,
      )

      // will be either set if the http header explicitly sends a range
      // object but also if the client sends a truthy `play` flag via query
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
        console.debug('requested range', http.request.headers.range)
        start = Number.parseInt(array[1])
        end = Number.parseInt(array[2])

        if (Number.isNaN(end)) {
          end =
            vRef.size - 1 < partialSize ? vRef.size - 1 : start + partialSize
        }
        rangeSize = end - start
      }

      // if client does not explicitly ask for range
      // we set up some fallback, based on the file size
      else {
        start = 0
        end = vRef.size - 1
        rangeSize = vRef.size
      }

      if (partial || http?.params?.query?.play === 'true') {
        streamRange = {
          start: start,
          end: end,
        }

        // replace start if not defined
        if (Number.isNaN(start) && !Number.isNaN(end)) {
          streamRange.start = end - rangeSize
          streamRange.end = end
        }

        // replace end if not defined
        if (!Number.isNaN(start) && Number.isNaN(end)) {
          streamRange.start = start
          streamRange.end = start + rangeSize
        }

        // cap to size if exceeded
        if (start + rangeSize >= vRef.size) {
          streamRange.end = vRef.size - 1
        }

        // range not satisfiable if out of bounds
        if (
          this.strict &&
          (streamRange.start >= vRef.size - 1 ||
            streamRange.end > vRef.size - 1)
        ) {
          responseType = '416'
        }

        // defaults to 206, partial content
        else {
          responseType = '206'
        }
      }

      const streamErrorHandler = (error) => {
        log(`[serve(${vRef.path}, ${versionName})] [500]`, error)
        http.response.writeHead(500)
        http.response.end(error.toString())
      }

      if (responseType === '400') {
        log(
          `[serve(${vRef.path}, ${versionName})] [400] Content-Length mismatch!`,
        )
        const text = 'Content-Length mismatch!'
        http.response.writeHead(400, {
          'Content-Type': 'text/plain',
          'Content-Length': text.length,
        })
        http.response.end(text)
      } else if (responseType === '416') {
        log(
          `[serve(${vRef.path}, ${versionName})] [416] Content-Range is not specified!`,
        )
        http.response.writeHead(416)
        http.response.end()
      } else if (responseType === '206') {
        const contentRange = `bytes ${streamRange.start}-${streamRange.end}/${vRef.size}`
        log(`[serve(${vRef.path}, ${versionName})] [206]`, {
          contentRange,
          rangeSize,
          streamRange: streamRange.end - streamRange.start,
          size: vRef.size,
        })

        // set content range

        const objectId = createObjectId({ gridFsFileId })
        const readStream = bucket.openDownloadStream(objectId, streamRange)

        http.response.setHeader('Content-Range', contentRange)
        http.response.setHeader('Cache-Control', 'no-store')
        http.response.setHeader(
          'Content-Disposition',
          getContentDisposition(file.name, http?.params?.query?.download),
        )
        http.response.writeHead(206)

        // The readSteam is a GridFSBucketReadStream, see:
        // https://mongodb.github.io/node-mongodb-native/4.5/classes/GridFSBucketReadStream.html
        // so we can simply pipe it into the http response

        readStream.on('error', streamErrorHandler).pipe(http.response)
      } else if (responseType === '200') {
        log(`[serve(${vRef.path}, ${versionName})] [200]`)

        const objectId = createObjectId({ gridFsFileId })
        const readStream = bucket.openDownloadStream(objectId)

        http.response.setHeader('Cache-Control', this.cacheControl)
        http.response.setHeader(
          'Content-Disposition',
          getContentDisposition(file.name, http?.params?.query?.download),
        )

        readStream.on('error', streamErrorHandler)

        readStream.on('data', (data) => {
          http.response.write(data)
        })

        readStream.on('end', () => {
          http.response.end()
        })
      } else {
        streamErrorHandler(
          new Error(`Unexpected response type [${responseType}]`),
        )
      }

      return true
    }
  }

  return function interceptDownload(http, file, versionName = 'original') {
    log('interceptDownload', file.name, versionName)

    const gridFsFileId = getGridFsFileId(file.versions, versionName, log)
    if (!gridFsFileId) {
      log('could not get gridFsFileId from ANY version', {
        versions: file.versions,
      })
      return false
    }

    log('found', { gridFsFileId })
    const gfsId = createObjectId({ gridFsFileId })
    const readStream = bucket.openDownloadStream(gfsId)
    readStream.on('data', (data) => {
      http.response.write(data)
    })

    readStream.on('end', () => {
      http.response.end()
    })

    readStream.on('error', (err) => {
      onErrorHook(err)
      // not found probably
      // eslint-disable-next-line no-param-reassign
      http.response.statusCode = 404
      http.response.end('not found')
    })

    http.response.setHeader('Cache-Control', this.cacheControl)
    http.response.setHeader(
      'Content-Disposition',
      getContentDisposition(file.name, http?.params?.query?.download),
    )
    return true
  }
}

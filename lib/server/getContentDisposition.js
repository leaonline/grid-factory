/**
 * Defines a content-disposition header value, based on a given download="true" flag.
 * @param fileName The name of the file to be used as filename value
 * @param downloadFlag the http query param
 * @return {string}
 */
export const getContentDisposition = (fileName, downloadFlag) => {
  const dispositionType = (downloadFlag === 'true')
    ? 'attachment;'
    : 'inline;'

  const encodedName = encodeURIComponent(fileName)
  const dispositionName = `filename="${encodedName}"; filename=*UTF-8"${encodedName}";`
  const dispositionEncoding = 'charset=utf-8'

  return `${dispositionType} ${dispositionName} ${dispositionEncoding}`
}

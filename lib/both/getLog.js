/**
 * Returns a log if the debug parameter is truthy, otherwise an empty function
 * @param debug {Boolean} flag to enable/disable debug logs
 * @param target {function} output target, defaults to console.debug
 * @return {function} the internal logger function
 */
export const getLog = (debug, target = console.debug) => {
  if (!debug) {
    return () => {}
  }

  return (...args) => target('[FilesCollectionFactory]:', ...args)
}

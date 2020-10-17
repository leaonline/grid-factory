export const getLog = debug => {
  if (!debug) {
    return () => {}
  }

  return (...args) => console.info('[FilesCollectionFactory]:', ...args)
}

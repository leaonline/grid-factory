export const getProp = (obj, propName) => {
  if (obj && typeof propName === 'string' && Object.prototype.hasOwnProperty.call(obj, propName)) {
    /* eslint-disable-next-line security/detect-object-injection -- Safe as checked for proto chain */
    return obj[propName]
  }
}

export const getProp = (obj, propName) => {
  if (
    obj &&
    typeof propName === 'string' &&
    Object.prototype.hasOwnProperty.call(obj, propName)
  ) {
    return obj[propName]
  }
}

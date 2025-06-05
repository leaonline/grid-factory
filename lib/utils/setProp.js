export const setProp = (obj, propName, value) => {
  const propKeyExists = propName in obj
  const hasOwn = Object.prototype.hasOwnProperty.call(obj, propName)

  if (typeof propName !== 'string' || (propKeyExists && !hasOwn)) {
    throw new Error(`Forbidden to set property ${propName}`)
  }

  /* eslint-disable-next-line security/detect-object-injection -- Safe as checked for proto chain */
  obj[propName] = value
}

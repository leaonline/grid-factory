import sinon from 'sinon'
const _stubs = new Map()

export const stub = (target, name, handler) => {
  if (_stubs.get(target)) {
    throw new Error(`already stubbed: ${name}`)
  }

  const stubbedTarget = sinon.stub(target, name)
  stubbedTarget.callsFake(handler)

  _stubs.set(stubbedTarget, name)
}

export const restore = (target, name) => {
  /* eslint-disable-next-line security/detect-object-injection -- Safe as checked for proto chain */
  if (!target[name] || !target[name].restore) {
    return // TODO info here?
  }

  /* eslint-disable-next-line security/detect-object-injection -- Safe as checked for proto chain */
  target[name].restore()
  _stubs.delete(target)
}

export const restoreAll = () => {
  _stubs.forEach((name, target) => {
    target.restore()
    _stubs.delete(target)
  })
}

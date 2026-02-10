import { expect } from 'chai'

export const expectThrow = async ({ fn, message, reason, details }) => {
  try {
    await fn()
    expect.fail('Expected function to throw an error, but it did not.')
  } catch (error) {
    if (message) {
      expect(error.message).to.equal(message)
    }
    if (reason) {
      expect(error.reason).to.equal(reason)
    }
    if (details) {
      expect(error.details).to.equal(details)
    }
  }
}

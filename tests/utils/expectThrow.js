import { expect } from 'chai'

export const expectThrow = async ({ fn, message }) => {
  try {
    await fn()
    throw new Error('Expected function to throw an error, but it did not.')
  } catch (error) {
    if (message) {
      expect(error.message).to.equal(message)
    }
  }
}

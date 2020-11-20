export const getBeforeRemove = ({ checkUser }) => function beforeRemove (file) {
  const self = this
  const userChecked = checkUser(self, file, 'remove')
  return typeof userChecked === 'undefined'
}

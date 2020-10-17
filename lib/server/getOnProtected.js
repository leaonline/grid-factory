export const getOnProtected = ({ checkUser }) => function onProtected (file) {
  const self = this
  const userChecked = checkUser(self, file, 'download')
  return typeof userChecked === 'undefined'
}
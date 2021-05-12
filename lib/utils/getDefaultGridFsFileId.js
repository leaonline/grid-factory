import { MongoInternals } from 'meteor/mongo'

export const getDefaultGridFsFileId = ({ gridFsFileId }) =>
  new MongoInternals.NpmModule.ObjectID(gridFsFileId)

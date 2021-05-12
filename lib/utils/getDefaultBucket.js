import { MongoInternals } from 'meteor/mongo'

let _defaultBucket

export const getDefaultBucket = bucketName => {
  if (!_defaultBucket) {
    _defaultBucket = new MongoInternals.NpmModule.GridFSBucket(MongoInternals.defaultRemoteCollectionDriver().mongo.db, { bucketName })
  }
  return _defaultBucket
}

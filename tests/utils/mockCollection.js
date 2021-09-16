import { Mongo } from 'meteor/mongo'

export const mockCollection = () => {
  return new Mongo.Collection(null)
}

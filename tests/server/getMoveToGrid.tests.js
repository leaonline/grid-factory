/* eslint-env mocha */
import { Random } from 'meteor/random'
import { expect } from 'chai'
import { getMoveToGrid } from '../../lib/server/getMoveToGrid'
import { mockCollection } from '../utils/mockCollection'
import Stream from 'stream'
import { getProp } from '../../lib/utils/getProp'

describe(getMoveToGrid.name, function () {
  it('moves all versions of a file to GridFS', async function () {
    const collection = mockCollection()
    const fileName = Random.id(5)
    const value = Random.id()
    const filesDoc = {
      _id: Random.id(),
      type: `custom/${Random.id(6)}`,
      name: fileName,
      path: `/files/${fileName}.ext`,
      meta: {
        value: Random.id()
      },
      versions: {
        original: {
          path: `/files/${fileName}.ext`
        },
        thumbnail: {
          path: `/files/thumb-${fileName}.ext`
        }
      }
    }

    await collection.insertAsync(filesDoc)

    let bucketWritten = false
    let fileRemoved = false

    const bucket = {
      openUploadStream (fileName, { contentType, metadata }) {
        expect(fileName).to.equal(filesDoc.name)
        expect(contentType).to.equal(filesDoc.type)
        expect(metadata.value).to.equal(filesDoc.meta.value)
        expect(metadata.fileId).to.equal(filesDoc._id)

        const writableStream = new Stream.Writable()
        writableStream._write = (chunk, encoding, next) => {
          expect(chunk.toString()).to.equal(value)
          bucketWritten = true
          next()
        }

        setTimeout(() => writableStream.emit('finish', {
          _id: { toHexString: () => value }
        }), 10)

        return writableStream
      }
    }

    const fs = {
      createReadStream (path) {
        if (path !== filesDoc.versions.original.path &&
          path !== filesDoc.versions.thumbnail.path) {
          expect.fail()
        }

        const readStream = new Stream.Readable({
          read () {}
        })
        readStream.push(value)
        return readStream
      }
    }

    const filesCollection = {
      async unlinkAsync (file, versionName) {
        expect(file._id).to.equal(filesDoc._id)
        const version = getProp(file.versions, versionName)
        expect(version.meta.gridFsFileId).to.equal(value)
        fileRemoved = true
      }
    }

    const log = () => {}
    const moveToGrid = getMoveToGrid({ bucket, fs, log })
    await moveToGrid(filesDoc, collection, filesCollection)

    expect(bucketWritten).to.equal(true)
    expect(fileRemoved).to.equal(true)
  })
})

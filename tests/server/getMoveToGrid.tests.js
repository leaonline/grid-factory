/* eslint-env mocha */
import { Random } from 'meteor/random'
import { expect } from 'chai'
import { getMoveToGrid } from '../../lib/server/getMoveToGrid'
import { mockCollection } from '../utils/mockCollection'
import Stream from 'node:stream'
import { getProp } from '../../lib/utils/getProp'

describe(getMoveToGrid.name, () => {
  it('moves all versions of a file to GridFS', async () => {
    const collection = mockCollection()
    const fileName = Random.id(5)
    const value = Random.id()
    const filesDoc = {
      _id: Random.id(),
      type: `custom/${Random.id(6)}`,
      name: fileName,
      path: `/files/${fileName}.ext`,
      meta: {
        value: Random.id(),
      },
      versions: {
        original: {
          path: `/files/${fileName}.ext`,
        },
        thumbnail: {
          path: `/files/thumb-${fileName}.ext`,
        },
      },
    }

    await collection.insertAsync(filesDoc)

    let bucketWrittenCalls = 0
    let fileRemovedCalls = 0
    let writableStreamClosed = 0

    const bucket = {
      name: 'testBucket',
      openUploadStream(fileName, data) {
        const { contentType, metadata } = data
        expect(fileName).to.equal(filesDoc.name)
        expect(contentType).to.equal(filesDoc.type)
        expect(metadata.value).to.equal(filesDoc.meta.value)
        expect(metadata.fileId).to.equal(filesDoc._id)

        const writableStream = new Stream.Writable({
          write(chunk, encoding, next) {
            expect(chunk.toString()).to.equal(value)
            bucketWrittenCalls++
            next()
          },
          final (cb) {
            writableStreamClosed++
            cb()
          }
        })
        writableStream.id = { toHexString: () => value }

        setTimeout(
          () =>
            writableStream.emit('finish', {
              _id: { toHexString: () => value },
            }),
          1000,
        )

        return writableStream
      },
    }

    const fs = {
      createReadStream(path) {
        if (
          path !== filesDoc.versions.original.path &&
          path !== filesDoc.versions.thumbnail.path
        ) {
          expect.fail()
        }

        return Stream.Readable.from([value])
      },
    }

    const filesCollection = {
      async unlinkAsync(file, versionName) {
        expect(file._id).to.equal(filesDoc._id)
        const version = getProp(file.versions, versionName)
        expect(version.meta.gridFsFileId).to.equal(value)
        fileRemovedCalls++
      },
    }

    const log = (...args) => console.debug('[getMoveToGrid]', ...args)
    const moveToGrid = getMoveToGrid({ bucket, fs, log })
    await moveToGrid(filesDoc, collection, filesCollection)

    expect(writableStreamClosed, 'remove calls').to.equal(2)
    expect(fileRemovedCalls, 'remove calls').to.equal(2)
    expect(bucketWrittenCalls, 'bucket calls').to.equal(2)
  })
  it('automatically closes the write stream if the read stream emits an error')
})

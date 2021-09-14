# Meteor Grid-Factory

[![Test suite](https://github.com/leaonline/grid-factory/actions/workflows/test-suite.yml/badge.svg)](https://github.com/leaonline/grid-factory/actions/workflows/test-suite.yml)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![built with Meteor](https://img.shields.io/badge/Meteor%20package-1.1.0-green?logo=meteor&logoColor=white)](https://meteor.com)
[![Project Status: Active – The project has reached a stable, usable state and is being actively developed.](https://www.repostatus.org/badges/latest/active.svg)](https://www.repostatus.org/#active)
![GitHub](https://img.shields.io/github/license/leaonline/publication-factory)

Create **FilesCollections** with integrated **GridFS** storage.
Lightweight. Simple.

With this package you can easily create multiple **`ostrio:files`** collections
(*FilesCollections*) that work with [MongoDB's
GridFS](https://docs.mongodb.com/manual/core/gridfs/) system **out-of-the-box**.

## Background / reasons

It can be a real hassle to introduce gridFS as storage to your project.
This package aims to abstract common logic into an easy and accessible API while
ensuring to let you override anything in case you need a fine-tuned custom
behavior.

The abtract factory allows you to create configurations on a higher level that
apply to all your FilesCollections, while you still can fine-tune on the
collection level. Supports all constructor arguments of FilesCollection.

## Table of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Why such a specialized package?](#why-such-a-specialized-package)
  - [What is covered / what is not (yet)](#what-is-covered--what-is-not-yet)
    - [Creation](#creation)
    - [`onBeforeUpload`](#onbeforeupload)
    - [`onAfterUpload`](#onafterupload)
    - [`protected`](#protected)
    - [`interceptDownload`](#interceptdownload)
    - [`onBeforeRemove`](#onbeforeremove)
    - [`afterRemove`](#afterremove)
- [Getting started](#getting-started)validateUser
  - [1. Install this package via](#1-install-this-package-via)
  - [2. Optionally install packages for mime-check and transformations](#2-optionally-install-packages-for-mime-check-and-transformations)
  - [3. Import the abstract factory](#3-import-the-abstract-factory)
  - [4. Create a server side FilesCollection factory](#4-create-a-server-side-filescollection-factory)
    - [Minimal example](#minimal-example)
  - [5. Create a client side factory](#5-create-a-client-side-factory)
- [Changelog](#changelog)
- [License](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Why such a specialized package?

This package is designed for projects, that can't rely on third-party storages,
because one or more of the following applies:

- there are concerns about privacy or security when using a third party storage
- the application has to be shipped in a "all-in-one" monolith
- the app is intended for intranet use and connection to the "outside" is
  prohibited
- whatever you can think of....

The use case may be not very common (Meteor + `ostrio:files` + GridFS) but if
it's for you, this package makes file handling much easier and consistent.

### What is covered by this package

This package has some **out-of-the-box** functionality that covers the following
points.

#### Creation

- [ x ] Creating new `FilesCollection` instances
- [ x ] Supporting full `FilesCollection` constructor
- [ x ] Allows to override package internals by explicitly passing the hooks
       (`onAfterUpload` etc.)
- [ x ] Code-splitting (server/client)
- [ x ] Using GridFS buckets instead of deprecated `gridfs-stream`
- [ x ] Adapter for translation
- [ x ] Creating new `FilesCollection` instances

#### `onBeforeUpload`

This package has some some default behavior defined for the `onBeforeUpload`
hook. You can override it completely or hook into it's behavior using the
following parameters:

- [ x ] check file size via `maxSize` (Number)
- [ x ] check file extensions via `extensions` ([String])
- [ x ] check permissions via `validateUser` (Function)
- [ x ] check permissions via `validateUser` (Function)

#### `onAfterUpload`

The default behavior for `onAfterUpload` is to check the mime of the uploaded
file and move it to the Grid. However, you can hook into this process, too:

- [ x ] validate user via `validateUser` (Function)
- [ x ] validate mime via `validateMime` (Function)
- [ x ] transform additional versions (e.g. thumbnails, converted videos, etc.)
        via `transformVersions` (Function)

#### `protected`

- [ x ] validate user via `validateUser` (Function)

#### `interceptDownload`

- [ x ] falls back to find a valid version, if request to a non-existent version
        fails
- [ x ] streams the file from the GridFS bucket
- [ x ] handles errors with an error response
- [ x ] sets the correct content disposition, depending on `download` query attribute
- [  ] TODO: 206 response streaming

#### `onBeforeRemove`

- [ x ] validate user via `validateUser` (Function)

#### `afterRemove`

- [ x ] removes file, including all versions, from the GridFS and the FilesCollection

## Getting started

### 1. Install this package via

```bash
meteor add leaonline:files-collection-factory ostrio:files
```

We decoupled this package from `ostrio:files` so your host project can manage
the versioning.

### 2. Optionally install packages for mime-check and transformations

If you want to check the mime you can use packages like `mmmagic` and `mime-types` to check for the correct mime type.
Of course you can implement your mime-check a total different way, too.

```bash
meteor npm install --save mmmagic mime-types
```

If you want to transform your images or videos you also need the respective packages for that.
Often you will also have to install additional software / packages on your host OS, since the npm packages
(e.g. for image magick / graphics magic) are usually just wrappers for the OS-level packages.

### 3. Import the abstract factory

The package exports different APIs for client and server but you import it the same way on server and client:

```javascript
import { createGridFilesFactory } from 'meteor/leaonline:grid-factory'
```

From here you have to consider the [FilesCollection architecture](https://github.com/VeliovGroup/Meteor-Files/blob/master/docs/constructor.md)
in order to manage access, post processing, removal etc.

### 4. Create a server side FilesCollection factory

On the server side you can use the following abstract factory api:

```javascript
({
  i18nFactory: Function, // translator function, str => translatedStr
  fs: Object, // the node file-system module
  bucketFactory: Function, // a function that returns a gridFS bucket
  defaultBucket: String, // a default name for the bucket to be used
  createObjectId: Function, // a function that creates an Object Id by a given GridFS id
  onError: Function, // logs errors for all collections across all factories
  debug: Boolean,
    ...config // all valid config, that can be passed to the FilesCollection server constructor
}) => Function => FilesCollection
```

The factory Function that is returned contains the following api:

```javascript
({
  bucketName: String, // override the defaultBucket, if desired
  maxSize: Number, // number in bytes to limit the maximum size for files of this collection
  extensions: [String], // a list of supported extensions
  validateUser: Function, // a Function that checks permission of the current user/file and returns falsy/truthy
  validateMime: Function, // async Function that checks permission of the current file/mime and returns falsy/truthy
  transformVersions: Function, // async Function that transforms the file to different versions
  onError: Function // logs errors, overrides onError from abstract factory
}) => FilesCollection
```

#### Minimal example

The following example shows a minimal abstract GridFactory:

```javascript
import { MongoInternals } from 'meteor/mongo'
import { createGridFilesFactory } from 'meteor/leaonline:grid-factory'
import { i18n } from '/path/to/i8n'
import fs from 'fs'

const debug = Meteor.isDevelopment
const i18nFactory = (...args) => i18n.get(...args)
const createObjectId = ({ gridFsFileId }) => new MongoInternals.NpmModule.ObjectID(gridFsFileId)
const bucketFactory = bucketName => 
  new MongoInternals.NpmModule.GridFSBucket(MongoInternals.defaultRemoteCollectionDriver().mongo.db, { bucketName })
const defaultBucket = 'fs' // resolves to fs.files / fs.chunks as default
const onError = error => console.error(error)

const createFilesCollection = createGridFilesFactory({ 
  i18nFactory, 
  fs, 
  bucketFactory, 
  defaultBucket, 
  createObjectId, 
  onError, 
  debug 
})

const ProfileImages = createFilesCollection({
  collectionName: 'profileImages',
  bucketName: 'images', // put image collections in the 'images' bucket
  maxSize: 3072000, // 3 MB max
  validateUser: function (userId, file, type, translate) {
    // is this a valid and registered user?
    if (!userId || Meteor.users.find(userId).count() !== 1) {
      return false
    }
    
    const isOwner = userId === file.userId
    const isAdmin = ...
    const isAllowedToDownload =  ...
    
    if (type === 'upload') {
      return Roles.userIsInRole(userId, 'can-upload', 'mydomain.com') // example of using roles
    }
    
    if (type === 'download') {
      return isOwner || isAdmin || isAllowedToDownload // custom flags
    }
    
    if (type === 'remove') {
     // allow only owner to remove the file
     return isOwner || isAdmin
    }
    
    throw new Error(translate('unexpectedCodeReach'))
  }
})
```

### 5. Create a client side factory

On the server side you have less options to pass to the API:

```javascript
({
  i18nFactory: Function, // translator function, str => translatedStr
  debug: Boolean,
  ...config // all valid config, that can be passed to the FilesCollection client constructor
}) => Function => FilesCollection
```

The factory Function that is returned contains the following api:

```javascript
({
  bucketName: String, // override the defaultBucket, if desired
  maxSize: Number, // number in bytes to limit the maximum size for files of this collection
  extensions: [String], // a list of supported extensions
  validateUser: Function, // a Function that checks permission of the current user/file and returns falsy/truthy
  validateMime: Function, // async Function that checks permission of the current file/mime and returns falsy/truthy
  transformVersions: Function, // async Function that transforms the file to different versions
  onError: Function // logs errors, overrides onError from abstract factory
}) => FilesCollection
```

## Contribution

Contributions are very welcomed! Please leave an issue before creating a PR in
order to discuss feasibility and boundaries of a potential PR.

## Testing

We provide a special Meteor project for tests for you. I contains scripts for
linting and testing out of the box:

```bash
cd test-proxy
meteor npm run setup
meteor npm run lint:code
meteor npm run lint:markdown
meteor npm run test:watch
```

## Changelog

- **1.2.0**
  - security patch to prevent server process crashing if mime check fails
  
- **1.1.0**
  - major bump for ostrio:files to support 1.x AND 2.x
  - logging improved
  - improved checks and loggins for all library functions
  - tests added
  - documentation improved
  
- **1.0.2**
  - getGridFsFileId fix bug searching fallback versions

- **1.0.1**
  - allow skipping user validation for prototyping but raise a server warning
  - README fix export name
  - standardjs lint fix
  
## License

MIT, see [LICENSE file](./LICENSE)

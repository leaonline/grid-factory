// Import Tinytest from the tinytest Meteor package.
import { Tinytest } from "meteor/tinytest";

// Import and rename a variable exported by files-collection-factory.js.
import { name as packageName } from "meteor/leaonline:files-collection-factory";

// Write your tests here!
// Here is an example.
Tinytest.add('files-collection-factory - example', function (test) {
  test.equal(packageName, "files-collection-factory");
});

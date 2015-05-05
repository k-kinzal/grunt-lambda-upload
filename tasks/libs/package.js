'use strict';
/* @flow */

var Promise = require('bluebird');
var JSZip = require('jszip');

var fetch = require('node-fetch'); fetch.Promise = Promise;
var fs = require('fs');

function Package() {}

Package.loadByUrl = function(url/*: string */, config/*: ?Object */) {
  return fetch(url).then(function(response) {
    return response.text().then(function() {
      // packages
      var buffer = response._raw.reduce(function(previousBuffer, currentBuffer) {
        var buffer = new Buffer(previousBuffer.length + currentBuffer.length);
        previousBuffer.copy(buffer);
        currentBuffer.copy(buffer, previousBuffer.length);
        return buffer;
      });
      return new JSZip(buffer);
    });
  // add config file to archive
  }).then(function(zip) {
    if (!!config) {
      zip.folder('config').file('local.json', JSON.stringify(config));
    }
    return zip;

  // upload Lambda Function
  }).then(function(zip) {
    return zip.generate({type:"nodebuffer"});
  });
};
Package.loadByFiles = function(files/*: Array<string> */, config/*: ?Object */) {
  // archive from local file
  return Promise.resolve(new JSZip()).then(function(zip) {
    files.forEach(function(filePath) {
      zip.file(filePath, fs.readFileSync(filePath));
    });
    return zip;
  // add config file to archive
  }).then(function(zip) {
    if (!!config) {
      zip.folder('config').file('local.json', JSON.stringify(config));
    }
    return zip;

  // upload Lambda Function
  }).then(function(zip) {
    return zip.generate({type:"nodebuffer"});
  });
};

module.exports = Package;
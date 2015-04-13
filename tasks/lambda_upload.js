'use strict';
// require
var AWS     = require('aws-sdk');
var JSZip   = require('jszip');
var Promise = require('bluebird');
var fetch   = require('node-fetch');
var fs      = require('fs');
var lambda  = Promise.promisifyAll(new AWS.Lambda(), {suffix: 'Promise'});


module.exports = function (grunt) {
  // register tasks
  grunt.registerMultiTask('lambda_upload', 'Upload AWS Lambda functions.', function () {
    // initialize
    var done    = this.async();
    var options = this.options();
    var files   = this.filesSrc;
    var promise = Promise.resolve(new JSZip());

    // load file
    if (!!options.url) {
      // archive from remote packages
      promise = promise.then(function(zip) {
        var _response;
        return fetch(options.url).then(function(response) {
          _response = response;
          return response.text();
        }).then(function(text) {
          return zip.load(_response._raw[0]);
        });
      });
    } else {
      // archive from local file
      promise = promise.then(function(zip) {
        files.forEach(function(filePath) {
          zip.file(filePath, fs.readFileSync(filePath));
        });
        return zip;
      });
    }
    // add config file to archive
    if (!!options.config && !!options.configFileName) {
      promise = promise.then(function(zip) {
        zip.folder('config').file(options.configFileName, JSON.stringify(options.config));
        return zip;
      });
    }
    // upload Lambda Function
    promise.then(function(zip) {
      // create parameter
      var params = {
        FunctionName: options.functionName,
        FunctionZip: zip.generate({type:"nodebuffer"}),
        Handler: options.handler,
        Mode: options.mode,
        Role: options.role,
        Runtime: options.runtime,
        Description: options.description,
        MemorySize: options.memorySize,
        Timeout: options.timeout
      };
      return lambda.uploadFunctionPromise(params);

    }).then(function(data) {
      grunt.log.ok('Package deployed "' + data.FunctionName + '" at ' + data.LastModified + '.');
      done(true);

    }).catch(function(err) {
      grunt.log.error(err.message);
      done(false);

    });

  });

};

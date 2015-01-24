'use strict';
// require
var _       = require('lodash');
var path    = require('path');
var fs      = require('fs');
var archive = require('archiver');
var Promise = require('bluebird');
var AWS     = require('aws-sdk');
var Lambda  = AWS.Lambda;
/*
 * grunt-lambda-upload
 * https://github.com/k-kinzal/grunt-lambda-upload
 *
 * Copyright (c) 2012-2015 k-kinzal
 * Licensed under the MIT license.
 */
module.exports = function (grunt) {
  // initialize
  var defaults = {
    credentials: {
      profile: null,
      region: 'us-east-1'
    }
  };
  // register tasks
  grunt.registerMultiTask('lambda_upload', 'Upload AWS Lambda functions.', function () {
    // initialize
    var done    = this.async();
    var options = this.options(defaults);
    var lambda  = Promise.promisifyAll(new Lambda(options.credentials));
    var packagePath = '.tmp/' + options.functionName + _.now() + '.zip';
    // create temporary directory
    grunt.file.mkdir(path.dirname(packagePath));
    // package
    var output = fs.createWriteStream(packagePath);
    var zip = archive('zip');
    zip.pipe(output);
    zip.bulk([{
      src: this.filesSrc,
      expand: true
    }]);
    zip.finalize();
    // packaged event
    output.on('close', function() {
      // create parameter
      var params = {
        FunctionName: options.functionName,
        FunctionZip: fs.readFileSync(packagePath),
        Handler: options.handler,
        Mode: options.mode,
        Role: options.role,
        Runtime: options.runtime,
        Description: options.description,
        MemorySize: options.memorySize,
        Timeout: options.timeout
      };
      // upload lambda
      lambda.uploadFunctionAsync(params).then(function(data) {
        grunt.log.ok('Package deployed "' + data.FunctionName + '" at ' + data.LastModified + '.');
        done(true);
      }).catch(function(err) {
        grunt.log.error(err.message);
        done(false);
      });
    });

  });

};
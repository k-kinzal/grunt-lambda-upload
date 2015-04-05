'use strict';
// require
var Promise = require('bluebird');
var AWS     = require('aws-sdk');
var Lambda  = AWS.Lambda;
var _       = require('lodash');
var archive = require('archiver');
var fs      = require('fs-extra');
var path    = require('path');
var tmp     = require('temporary');

var lambda  = Promise.promisifyAll(new Lambda());
/*
 * grunt-lambda-upload
 * https://github.com/k-kinzal/grunt-lambda-upload
 *
 * Copyright (c) 2012-2015 k-kinzal
 * Licensed under the MIT license.
 */
module.exports = function (grunt) {
  // register tasks
  grunt.registerMultiTask('lambda_upload', 'Upload AWS Lambda functions.', function () {
    // initialize
    var done    = this.async();
    var options = this.options();
    var packagePath = dir + '/' + options.functionName + _.now() + '.zip';
    // generate config
    var currentPath = path.resolve('.');
    var files = this.filesSrc;
    var config = options.config;
    if (!!config && options.configFileName) {
      var dir = currentPath = (new tmp.Dir()).path;
      // copy to temporary directory
      files.forEach(function(fromPath, index) {
        var toPath = dir + '/' + fromPath;
        var toDir  = path.dirname(toPath);
        if (!fs.existsSync(toDir)) {
          fs.ensureDir(toDir);
        }
        fs.copySync(fromPath, toPath);
      });
      // generate config
      if (fs.existsSync('config')) {
        if (!fs.existsSync(dir + '/config')) {
          fs.ensureDir(dir + '/config');
        }
        fs.writeFile(dir + '/config/' + options.configFileName, JSON.stringify(config));
        files.push('config/' + options.configFileName);
      }
    }
    // create temporary directory
    grunt.file.mkdir(path.dirname(packagePath));
    // package
    var output = fs.createWriteStream(packagePath);
    var zip = archive('zip');
    console.log(currentPath);
    zip.pipe(output);
    zip.bulk([{
      src: files,
      expand: true,
      cwd: currentPath
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
      upload lambda
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
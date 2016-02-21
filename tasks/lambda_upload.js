'use strict';
// require
var AWS = require('aws-sdk');
var JSZip = require('jszip');
var Promise = require('bluebird');
var fetch = require('node-fetch');
var fs = require('fs');
var lambda = Promise.promisifyAll(new AWS.Lambda(), {
  suffix: 'Promise'
});


module.exports = function(grunt) {
  // register tasks
  grunt.registerMultiTask('lambda_upload', 'Upload AWS Lambda functions.', function() {
    // initialize
    var done = this.async();
    var options = this.options();
    var files = this.filesSrc;
    var promise = Promise.resolve(new JSZip());

    // load file
    if (!!options.url) {
      var url = options.url;
      delete(options.url);
      // archive from remote packages
      promise = promise.then(function(zip) {
        var _response;
        return fetch(url).then(function(response) {
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
          if (!grunt.file.isDir(filePath)) {
            zip.file(filePath, fs.readFileSync(filePath));
          }
        });
        return zip;
      });
    }
    // add config file to archive
    if (!!options.config && !!options.configFileName) {
      var config = options.config;
      delete(options.config);
      var configFileName = options.configFileName;
      delete(options.configFileName);
      promise = promise.then(function(zip) {
        zip.folder('config').file(configFileName, JSON.stringify(config));
        return zip;
      });
    }
    // upload Lambda Function
    promise.then(function(zip) {
      // create parameter
      var params = {
        Code: {
          ZipFile: zip.generate({
            type: "nodebuffer"
          })
        }
      };
      Object.keys(options).forEach(function(key) {
        params[key.charAt(0).toUpperCase() + key.slice(1)] = options[key];
      });

      if (!!options.update){
        return lambda.createFunctionPromise(params);
      } else {
        var params2 = params.Code;
        params2.FunctionName = params.FunctionName;
        params2.Publish = true;
        return lambda.updateFunctionCodePromise(params2);
      }

    }).then(function(data) {
      grunt.log.ok('Package deployed "' + data.FunctionName + '" at ' + data.LastModified + '.');
      done(true);

    }).catch(function(err) {
      grunt.log.error(err);
      done(false);

    });

  });

};

'use strict';
// require
var AWS     = require('aws-sdk');
var Bacon = require('baconjs').Bacon,
var JSZip   = require('jszip');
var Promise = require('bluebird');
var fetch   = require('node-fetch');
var fs      = require('fs');
var lambda  = Promise.promisifyAll(new AWS.Lambda(), {suffix: 'Promise'});

module.exports = function (grunt) {
  // register tasks
  grunt.registerMultiTask('lambda_upload', 'Upload AWS Lambda functions.', function () {
    // initialize
    var done = this.async();
    var options = this.options();
    var files = this.filesSrc;
    var url = options.url;
    var config = options.config;
    // get remote package or add local package
    var λ = new Lambda(options.name);
    // add config file
    λ = λ.withPackages(url ? packageRepository.resolveByUrl(url)
                           : packageRepository.resolveByFiles(files))
         .withConfig(config || {})
         .withOption(option)
         .withEventSource();
    // upload lambda function
    repository.store(λ).then(function() {
      grunt.log.ok('Package deployed "' + data.FunctionName + '" at ' + data.LastModified + '.');
      done();
    }).catch(function(err) {
      grunt.log.error(err);
      done(false);
    });
};

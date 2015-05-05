'use strict';
/* @flow */

var AWS = require('aws-sdk');
var Lambda = AWS.Lambda;
var Promise = require('bluebird');

var fs = require('fs');
var path = require('path');

function factory(name/*: string */, version/*: string */)/*: Object */ {
  // initialize
  var lambda = new Lambda({apiVersion: version});
  // get latest version
  if (version === 'latest') {
    var apiPath = path.join(process.env.PWD, 'node_modules/aws-sdk/apis');
    var regexp = new RegExp('^' + name + '-([0-9]{4}-[0-9]{2}-[0-9]{2}).min.json$');
    var files = fs.readdirSync(apiPath).filter(function(file) {
      return regexp.test(file);
    });
    files.sort();
    var file = files[files.length - 1];
    var match = file.match(regexp);
    if (!match) {
      throw new Error();
    }
    version = match[1];

  }
  // intercept to exclude parameters
  var json = require('aws-sdk/apis/' + name + '-' + version + '.min.json');
  Object.keys(json.operations).forEach(function(operationName) {
    var func = lambda[operationName];
    var operation = json.operations[operationName];
    var members = operation.input.members;
    lambda[operationName] = function(params, callback) {
      var p = {};
      Object.keys(members).forEach(function(key) {
        var value = params[key.charAt(0).toLowerCase() + key.slice(1)] || params[key];
        if (!!value) {
          p[key] = value;
        }
      });
      return func.call(lambda, p, callback);
    };
  });
  
  return Promise.promisifyAll(lambda, {suffix: 'Promise'});;
}

module.exports = factory;
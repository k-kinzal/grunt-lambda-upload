'use strict';
/* @flow */

var Archive = require('jszip');
var Lambda = require('../models/lambda');
var EventSource = require('../models/eventsource');
var Permission = require('../models/permission');
var Promise = require('bluebird');

var api = require('../libs/api');
var packages = require('../libs/package');

/**
 * Repository of AWS Lambda model
 */
function LambdaRepository() {}
/**
 * resolve by lambda function name
 */
LambdaRepository.resolveBy = function(functionName/*: string */)/*: Promise */ {
  return Promise.all([
    api.getAsync(functionName),
    api.getEventSourceMapAsync(functionName),
    api.getPermissionAsync(functionName)
  ]).then(function(lambda, eventSources, policy) {
    return packages.loadByUrl(lambda.codeUrl, null).then(function(buffer) {
      // eventsources
      var sources = eventSources.map(function(eventSource) {
        return new EventSource(eventSource);
      });
      // permission
      var permission;
      if (policy) {
        permission = new Permission(policy);
      }
      // create entity
      return new Lambda({
        functionArn: lambda.functionArn,
        packages: buffer,
        option: lambda.option,
        eventSources: sources,
        permission: permission
      });
    });
  });
};
/**
 * store by lambda function
 */
LambdaRepository.store = function(entity/*: Lambda */)/*: Promise */ {
  var functionName = entity.option.functionName;
  var promise = !entity.functionArn
      ? api.createAsync(functionName, entity.packages, entity.option)
      : api.updateAsync(functionName, entity.packages, entity.option);
  promise.then(function() {
    return api.putEventSourceMapAsync(functionName, (entity.eventSources/*: ?Array<Object> */) || []);
  }).then(function() {
    return api.putPermissionAsync(functionName, entity.permission)
  });
};
/**
 * delete by lambda function
 */
LambdaRepository.deleteBy = function(functionName/*: string */)/*: Promise */ {
  return api.deleteAsync(functionName);
}
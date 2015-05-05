'use strict';
/* @flow */
var Promise = require('bluebird');
var ResourceNotFoundException;

var _ = require('lodash');
var extend/*: <A: Object, B: Object>(a: A, b: B) => A & B */ = require('extend');
var factory = require('../libs/factory');
var lambda = factory('lambda', 'latest');

/*::
type FunctionName = string;
type Packages = Buffer;
type Option = {
  description?: ?string;
  functionName: string;
  handler: string;
  memorySize?: ?number;
  role: string;
  runtime: string;
  timeout?: ?number;
};
type EventSource = {
  uuid?: ?string;
  batchSize?: ?number;
  enabled?: ?boolean;
  eventSourceArn: string;
  functionName: string;
  startingPosition?: ?string;
};
type Permission = {
  action: string;
  principal: string;
  sourceAccount?: ?string;
  sourceArn?: ?string;
  statementId: string;
};
*/

/**
 * API warapper of AWS Lambda
 */
function LambdaApi() {}
/**
 * create lambda function
 */
LambdaApi.createAsync = function(
  functionName/*: FunctionName */
  , packages/*: Packages */
  , option/*: Option */)/*: Promise */ {
  return Promise.resolve().then(function() {
    // creaet function
    var params = extend({
      Code: {
        ZipFile: packages
      }
    }, option);
    return lambda.createFunctionPromise(params);
  });
};
/**
 * get lambda function
 */
LambdaApi.getAsync = function(functionName/*: FunctionName */)/*: Promise */ {
  // get lambda function
  return Promise.resolve().then(function() {
    var params = {
      FunctionName: functionName
    };
    return lambda.getFunctionPromise(params);
  // creaet entity
  }).then(function(data) {    
    return {
      functionArn: data.Configuration.FunctionArn,
      functionName: data.Configuration.FunctionName,
      codeUrl: data.Code.Location,
      option: toLowerKey(data.Configuration),
    };
  });
};
/**
 * update lambda function
 */
LambdaApi.updateAsync = function(
  functionName/*: FunctionName */
  , packages/*: Packages */
  , option/*: Option */)/*: Promise */ {
  return Promise.resolve().then(function() {
    // update function
    var params = {
      FunctionName: functionName,
      ZipFile: packages
    };
    return lambda.updateFunctionCodePromise(params);
  }).then(function() {
    // update configuration
    return lambda.updateFunctionConfigurationPromise(option);
  });

};
/**
 * delete lambda function
 */
LambdaApi.deleteAsync = function(functionName/*: FunctionName */)/*: Promise */ {
  var params = {
    FunctionName: functionName
  };
  return lambda.deleteFunction(params);
};
/**
 * get eventsource map of AWS Lambda
 */
LambdaApi.getEventSourceMapAsync = function(functionName/*: FunctionName */)/*: Promise */ {
  var params = {
    FunctionName: functionName
  };
  return lambda.listEventSourceMappings(params).then(function(data) {
    return data.EventSourceMappings.forEach(toLowerKey);
  });
};
/**
 * put eventsource map of AWS Lambda
 */
LambdaApi.putEventSourceMapAsync = function(
  functionName/*: FunctionName */
  , eventSources/*: Array<EventSource> */)/*: Promise */ {
  // get eventsource map
  return lambda.ListEventSourceMappings({
    FunctionName: functionName
    // convert to entity
  }).then(function(data) {
    return data.EventSourceMappings.map(function(eventSource) {
      var eventSource_ = {};
      eventSource_.functionName = functionName;
      Object.keys(eventSource).forEach(function(key) {
        if (key === 'UUID') {
          eventSource_.uuid = eventSource[key];
          return;
        }
        eventSource_[key.charAt(0).toLowerCase() + key.slice(1)] = eventSource[key];
      });
      return eventSource_;
    });
  // put eventsource map
  }).then(function(eventSources_) {
    // create eventsource set
    var eventSourceSet1 = {};
    eventSources.forEach(function(eventSource) {
      eventSourceSet1[eventSource.eventSourceArn] = eventSource;
    });
    var eventSourceSet2 = {};
    eventSources_.forEach(function(eventSource) {
      eventSourceSet2[eventSource.eventSourceArn] = eventSource;
    });
    // create keys
    var keys1 = Object.keys(eventSourceSet1);
    var keys2 = Object.keys(eventSourceSet2);
    // put eventsource map
    var promises1 = _.difference(keys1, keys2).map(function(key) {
     // create eventsource map
      return lambda.insertEventSourceMappingPromise(eventSourceSet1[key]);
    });
    var promises2 = _.intersection(keys1, keys2).map(function(key) {
      // update eventsource map
      return lambda.updateEventSourceMappingPromise(eventSourceSet1[key]);
    });
    var promises3 = _.difference(keys2, keys1).map(function(key) {
      // delete eventsource map
      return lambda.deleteEventSourceMappingPromise(eventSourceSet2[key]);

    });

    return Promise.all(promises1.concat(promises2, promises3));
  });

};
/**
 * get permission of AWS Lambda
 */
LambdaApi.getPermissionAsync = function(functionName/*: FunctionName */)/*: Promise */ {
  var params = {
    FunctionName: functionName
  };
  return lambda.getPolicyPromise(params).then(function(data) {
    var policy = JSON.parse(data.Policy);
    return {
      action: policy.Statement[0].Action,
      principal: policy.Statement[0].Principal.Service,
      sourceAccount: policy.Statement[0].Condition.StringEquals['AWS:SourceAccount'],
      sourceArn: policy.Statement[0].Condition.ArnLike['AWS:AWS:SourceArn'],
      statementId: policy.Statement[0].Sid,
    };
  }).catch(ResourceNotFoundException, function(){
    return null;
  });
};
/**
 * put permission map of AWS Lambda
 */
LambdaApi.putPermissionAsync = function(
  functionName/*: FunctionName */
  , permission/*: ?Permission */)/*: Promise*/ {
  return Promise.resolve(function() {
    return lambda.removePermissionPromise(permission)
      .catch(ResourceNotFoundException, function(){});
  }).then(function() {
    if (!!permission) {
      return Promise.resolve();
    }
    return lambda.addPermission(permission);
  });
};

function toUpperKey(obj) {
  var res = {};
  Object.keys(obj).forEach(function(key) {
    if (key.match(/^uuid|url$/)) {
      res[key.toUpperCase()] = obj[key];
      return;
    }
    res[key.charAt(0).toUpperCase() + key.slice(1)] = obj[key];
  });
  return res;
}
function toLowerKey(obj) {
  var res = {};
  Object.keys(obj).forEach(function(key) {
    if (key.match(/^[A-Z][A-Z0-9]+$/)) {
      res[key.toLowerCase()] = obj[key];
      return;
    }
    res[key.charAt(0).toLowerCase() + key.slice(1)] = obj[key];
  });
  return res;
}

module.exports = LambdaApi;
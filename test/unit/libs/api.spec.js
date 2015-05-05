'use strict';
// require
var assert = require('power-assert');
var api = require('../../../tasks/libs/api');
var sinon = require('sinon');
var proxyquire = require('proxyquire');
var factory = require('../../../tasks/libs/factory');

var shouldFulfilled = require("promise-test-helper").shouldFulfilled;
var shouldRejected = require("promise-test-helper").shouldRejected;
// test
describe('LambdaApi', function() {

  var lambda, api;
  beforeEach(function() {
    lambda = factory('lambda', 'latest');
    api = proxyquire('../../../tasks/libs/api', {
      '../libs/factory': function() {
        return lambda;
      }
    });
  });

  describe('createAsync', function() {
    it('should create lambda function', function() {
      // create stub
      var stub = sinon.stub(lambda, 'createFunctionPromise').returns(Promise.resolve());
      // call method
      var functionName = '';
      var packages = new Buffer('');
      var option = {};

      var promise = api.createAsync(functionName, packages, option);

      return shouldFulfilled(promise).then(function() {
        assert(stub.calledOnce);
      });
    });
    it('should have failed to create lambda function', function() {
      // create stub
      var stub = sinon.stub(lambda, 'createFunctionPromise').returns(Promise.rejected());
      // call method
      var functionName = '';
      var packages = new Buffer('');
      var option = {};

      var promise = api.createAsync(functionName, packages, option);

      return shouldRejected(promise).catch(function() {
        assert(stub.calledOnce === false);
      });
    });
  });

  // describe('getAsync', function() {
  //   it('should get lambda function', function() {
  //     // create stub
  //     var data = {
  //       Code: {
  //         Location: 'http://example.jp/packages.zip',
  //         RepositoryType: 's3'
  //       },
  //       Configuration: {
  //         CodeSize: 100,
  //         Description: 'description',
  //         FunctionArn: 'arn:aws:lambda:us-east-1:125043710017:function:stub-function',
  //         FunctionName: 'stub-function',
  //         Handler: 'index.handler',
  //         LastModified: '2015-03-22T09:53:46.282+0000',
  //         MemorySize: 128,
  //         Role: 'arn:aws:iam::125043710017:role/stub-function-role',
  //         Runtime: 'nodejs',
  //         Timeout: 3
  //       }
  //     };
  //     var stub = sinon.stub(lambda, 'getFunctionPromise').returns(Promise.resolve(data));
  //     // call method
  //     var functionName = 'stub-function';
  //     var promise = api.getAsync(functionName);

  //     return shouldFulfilled(promise).then(function(lambda) {
  //       assert(stub.calledOnce);
  //       // assert(lambda.functionArn === data.Configuration.FunctionArn);
  //       assert(lambda.functionName === data.Configuration.FunctionName);
  //       assert(lamnda.functionName === 1);
  //       // assert(lambda.option.codeSize == data.Configuration.CodeSize);
  //       // assert(lambda.option.description == data.Configuration.Description);
  //       // assert(lambda.option.functionArn == data.Configuration.FunctionArn);
  //       // assert(lambda.option.functionName == data.Configuration.FunctionName);
  //       // assert(lambda.option.handler == data.Configuration.Handler);
  //       // assert(lambda.option.lastModified == data.Configuration.LastModified);
  //       // assert(lambda.option.memorySize == data.Configuration.MemorySize);
  //       // assert(lambda.option.role == data.Configuration.Role);
  //       // assert(lambda.option.runtime == data.Configuration.Runtime);
  //       // assert(lambda.option.timeout == data.Configuration.Timeout);
  //     });
  //   });
  // });

});

// function api(callback) {
//   return function() {
//     var lambda = factory('lambda', 'latest');
//     var api = proxyquire('../../../tasks/libs/api', {
//       '../libs/factory': function() {
//         return lambda;
//       }
//     });

//     return callback(api);
//   };
// }

// function createApiStub(lambda, ) {
//   return proxyquire('../../../tasks/libs/api', {
//     '../libs/factory': function() {
//       return stub;
//     }
//   });
// }

function fulfilled(value) {
  return Promise.resolve(value);
}

function rejected(err) {
  return Promise.reject(err);
}
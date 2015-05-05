'use strict';
/* @flow */

/*:: import type * as Archive from 'jszip'; */
/*:: import type * as EventSource from './eventsource'; */
/*:: import type * as Permission from './permission'; */
var clone/*: <T>(a: T) => T */ = require('clone');
var extend/*: <A: Object, B: Object>(a: A, b: B) => A & B */ = require('extend');


/**
 * AWS Lambda model
 *
 * @constructor
 */
function Lambda(obj/*: {
    functionArn?: ?string;
    packages: Archive;
    option: {
      description?: ?string;
      functionName: string;
      handler: string;
      memorySize?: ?number;
      role: string;
      runtime: string;
      timeout?: ?number;
    };
    eventSources?: Array<EventSource>;
    permission?: Permission;
  } */) {
  // FIXME: want to declare a properties
  /*:: Lambda.prototype.functionArn = obj.functionArn;
       Lambda.prototype.packages = obj.packages;
       Lambda.prototype.option = obj.option;
       Lambda.prototype.eventSources = obj.eventSources;
       Lambda.prototype.permission = obj.permission; */
  Object.keys(obj).forEach(function(key) {
    self[key] = clone(obj[key]);
  });
}
/**
 * Get with setting properties
 */
Lambda.prototype.with = function(obj) {
  return new Lambda(extend(this._toObject(), obj));
};
/**
 * Convert to object
 * @private
 */
Lambda.prototype._toObject = function() {
  return clone(this);
};

module.exports = Lambda;

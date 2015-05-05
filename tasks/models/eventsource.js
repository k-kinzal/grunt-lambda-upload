'use strict';
/* @flow */

var clone/*: <T>(a: T) => T */ = require('clone');
var extend/*: <A: Object, B: Object>(a: A, b: B) => A & B */ = require('extend');

/**
 * EventSource of Lambda Function
 *
 * @constructor
 */
function EventSource(
  obj/*: {
    uuid?: ?string;
    batchSize?: ?number;
    enabled?: boolean;
    eventSourceArn: string;
    functionName: string;
    startingPosition?: ?string;
  } */) {
  // FIXME: want to declare a properties
  /*:: EventSource.prototype.uuid = obj.uuid;
       EventSource.prototype.batchSize = obj.batchSize;
       EventSource.prototype.enabled = obj.enabled;
       EventSource.prototype.eventSourceArn = obj.eventSourceArn;
       EventSource.prototype.functionName = obj.functionName;
       EventSource.prototype.startingPosition = obj.startingPosition; */
  Object.keys(obj).forEach(function(key) {
    this[key] = clone(obj[key]);
  });
}
/**
 * Get with setting properties
 */
EventSource.prototype.with = function(obj) {
  return new EventSource(extend(this._toObject(), obj));
};
/**
 * Convert to object
 * @private
 */
EventSource.prototype._toObject = function() {
  return clone(this);
};

module.exports = EventSource;
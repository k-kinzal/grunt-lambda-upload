'use strict';
/* @flow */

var clone/*: <T>(a: T) => T */ = require('clone');
var extend/*: <A: Object, B: Object>(a: A, b: B) => A & B */ = require('extend');

/**
 * Permission of Lambda Function
 *
 * @constructor
 */
function Permission(
  obj/*: {
    action: string;
    principal: string;
    sourceAccount?: ?string;
    sourceArn?: ?string;
    statementId: string;
  } */) {
  // FIXME: want to declare a properties
  /*:: Permission.prototype.action = obj.action;
       Permission.prototype.principal = obj.principal;
       Permission.prototype.sourceAccount = obj.sourceAccount;
       Permission.prototype.sourceArn = obj.sourceArn;
       Permission.prototype.statementId = obj.statementId; */
  Object.keys(obj).forEach(function(key) {
    this[key] = clone(obj[key]);
  });
}
/**
 * Get with setting properties
 */
Permission.prototype.with = function(obj) {
  return new Permission(extend(this._toObject(), obj));
};
/**
 * Convert to object
 * @private
 */
Permission.prototype._toObject = function() {
  return clone(this);
};

module.exports = Permission;
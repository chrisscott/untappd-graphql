'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _nodeCache = require('node-cache');

var _nodeCache2 = _interopRequireDefault(_nodeCache);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var cache = new _nodeCache2.default({ stdTTL: 60 * 60 * 24 }); // default TTL to one day

exports.default = cache;
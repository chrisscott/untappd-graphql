"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "schema", {
  enumerable: true,
  get: function get() {
    return _schema["default"];
  }
});
Object.defineProperty(exports, "typeDefs", {
  enumerable: true,
  get: function get() {
    return _typeDefs["default"];
  }
});
Object.defineProperty(exports, "resolvers", {
  enumerable: true,
  get: function get() {
    return _resolvers["default"];
  }
});

var _schema = _interopRequireDefault(require("./api/schema"));

var _typeDefs = _interopRequireDefault(require("./api/typeDefs"));

var _resolvers = _interopRequireDefault(require("./api/resolvers"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
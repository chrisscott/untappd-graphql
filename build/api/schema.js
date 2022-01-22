"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _schema = require("@graphql-tools/schema");

var _resolvers = _interopRequireDefault(require("./resolvers"));

var _typeDefs = _interopRequireDefault(require("./typeDefs"));

const schema = (0, _schema.makeExecutableSchema)({
  typeDefs: _typeDefs.default,
  resolvers: _resolvers.default
});
var _default = schema;
exports.default = _default;
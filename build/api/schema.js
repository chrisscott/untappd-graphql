"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _graphqlTools = require("graphql-tools");

var _resolvers = _interopRequireDefault(require("./resolvers"));

var _typeDefs = _interopRequireDefault(require("./typeDefs"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var schema = (0, _graphqlTools.makeExecutableSchema)({
  typeDefs: _typeDefs["default"],
  resolvers: _resolvers["default"]
});
var _default = schema;
exports["default"] = _default;
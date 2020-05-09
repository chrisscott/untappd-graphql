"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _axios = _interopRequireDefault(require("axios"));

var _crypto = _interopRequireDefault(require("crypto"));

var _bluebird = _interopRequireDefault(require("bluebird"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function () { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _wrapNativeSuper(Class) { var _cache = typeof Map === "function" ? new Map() : undefined; _wrapNativeSuper = function _wrapNativeSuper(Class) { if (Class === null || !_isNativeFunction(Class)) return Class; if (typeof Class !== "function") { throw new TypeError("Super expression must either be null or a function"); } if (typeof _cache !== "undefined") { if (_cache.has(Class)) return _cache.get(Class); _cache.set(Class, Wrapper); } function Wrapper() { return _construct(Class, arguments, _getPrototypeOf(this).constructor); } Wrapper.prototype = Object.create(Class.prototype, { constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true } }); return _setPrototypeOf(Wrapper, Class); }; return _wrapNativeSuper(Class); }

function _construct(Parent, args, Class) { if (_isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _isNativeFunction(fn) { return Function.toString.call(fn).indexOf("[native code]") !== -1; }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

global.Promise = _bluebird["default"];

var debugCache = require('debug')('untappd-graphql:cache');

var debugApi = require('debug')('untappd-graphql:api');

var debugApiVerbose = require('debug')('untappd-graphql:api:verbose');

var _process$env = process.env,
    UNTAPPD_CLIENT_ID = _process$env.UNTAPPD_CLIENT_ID,
    UNTAPPD_CLIENT_SECRET = _process$env.UNTAPPD_CLIENT_SECRET;
var UNTAPPD_API_ROOT = 'https://api.untappd.com/v4';
var authKeys = {
  client_id: UNTAPPD_CLIENT_ID,
  client_secret: UNTAPPD_CLIENT_SECRET
};

var AppError = /*#__PURE__*/function (_Error) {
  _inherits(AppError, _Error);

  var _super = _createSuper(AppError);

  function AppError(opts) {
    var _this;

    _classCallCheck(this, AppError);

    _this = _super.call(this, opts.message);
    _this.status = opts.status;
    return _this;
  }

  return AppError;
}( /*#__PURE__*/_wrapNativeSuper(Error));

var getResults = function getResults(path, args, context) {
  var cache = context.cache || false;
  var rateLimitFor = 'app';
  var key;
  debugApi('getting results for %s args:%o', path, args);

  if (context.user && context.user.data.untappd) {
    debugApi('using client access_token for authorization for %s args:%o', path, args);
    var access_token = context.user.data.untappd;
    authKeys = {
      access_token: access_token
    };
    rateLimitFor = "user ".concat(access_token.slice(8));
  } else {
    debugApi('using client ID and secret for authorization');
  }

  if (cache) {
    key = _crypto["default"].createHash('md5').update(JSON.stringify({
      path: path,
      args: args
    })).digest('hex');
    var cachedResult = cache.get(key);

    if (cachedResult) {
      debugCache('using cached result for %s args:%o', path, args);
      return cachedResult;
    }
  }

  return _axios["default"].get("".concat(UNTAPPD_API_ROOT, "/").concat(path), {
    params: Object.assign({}, authKeys, args),
    headers: {
      'User-Agent': "untappd-graphql (".concat(UNTAPPD_CLIENT_ID, ")")
    }
  }).bind(debugApi, debugCache, debugApiVerbose).then(function (response) {
    var headers = response.headers,
        data = response.data;
    debugApi('x-ratelimit-remaining for %s: %d', rateLimitFor, headers['x-ratelimit-remaining']);
    debugApi('received result for %s args:%o', path, args);
    debugApiVerbose('API result: %O', data);

    if (headers['x-ratelimit-remaining'] === 0) {
      debugApi('rate limit met, returning with no data');
      return {
        found: 0
      };
    }

    if (cache) {
      debugCache('caching result for %s args:%o', path, args);
      cache.set(key, data);
    }

    return data;
  })["catch"](function (error) {
    var _error$response = error.response,
        data = _error$response.data,
        status = _error$response.status,
        headers = _error$response.headers;
    debugApi('x-ratelimit-remaining for %s: %d', rateLimitFor, headers['x-ratelimit-remaining']);
    debugApi('API error: %s', error);
    var message = data;

    if (data.meta) {
      message = data.meta.error_detail;
    }

    throw new AppError({
      message: message,
      status: status
    });
  });
};

var resolvers = {
  Query: {
    brewerySearchInflated: function brewerySearchInflated(root, args, context) {
      return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
        var res, _res$response, found, _res$response$brewery, items;

        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return getResults('search/brewery', args, context);

              case 2:
                res = _context2.sent;
                _res$response = res.response, found = _res$response.found, _res$response$brewery = _res$response.brewery.items, items = _res$response$brewery === void 0 ? [] : _res$response$brewery;

                if (!(found === 0)) {
                  _context2.next = 6;
                  break;
                }

                return _context2.abrupt("return", undefined);

              case 6:
                return _context2.abrupt("return", items.map( /*#__PURE__*/function () {
                  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(item) {
                    var brewery;
                    return regeneratorRuntime.wrap(function _callee$(_context) {
                      while (1) {
                        switch (_context.prev = _context.next) {
                          case 0:
                            brewery = item.brewery;
                            _context.next = 3;
                            return getResults("brewery/info/".concat(brewery.brewery_id), {}, context);

                          case 3:
                            res = _context.sent;
                            return _context.abrupt("return", res.response.brewery);

                          case 5:
                          case "end":
                            return _context.stop();
                        }
                      }
                    }, _callee);
                  }));

                  return function (_x) {
                    return _ref.apply(this, arguments);
                  };
                }()));

              case 7:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2);
      }))();
    },
    brewerySearch: function brewerySearch(root, args, context) {
      return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
        var res, _res$response2, found, items;

        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return getResults('search/brewery', args, context);

              case 2:
                res = _context3.sent;
                _res$response2 = res.response, found = _res$response2.found, items = _res$response2.brewery.items;

                if (!(found === 0)) {
                  _context3.next = 6;
                  break;
                }

                return _context3.abrupt("return", undefined);

              case 6:
                return _context3.abrupt("return", items.map(function (item) {
                  return item.brewery;
                }));

              case 7:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3);
      }))();
    },
    breweryInfo: function breweryInfo(root, args, context) {
      return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
        var res;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return getResults("brewery/info/".concat(args.id), {}, context);

              case 2:
                res = _context4.sent;
                return _context4.abrupt("return", res.response.brewery);

              case 4:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4);
      }))();
    }
  }
};
var _default = resolvers;
exports["default"] = _default;
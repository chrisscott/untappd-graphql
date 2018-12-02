'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new _bluebird2.default(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return _bluebird2.default.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

global.Promise = _bluebird2.default;

var debugCache = require('debug')('untappd-graphql:cache');
var debugApi = require('debug')('untappd-graphql:api');

var _process$env = process.env,
    UNTAPPD_CLIENT_ID = _process$env.UNTAPPD_CLIENT_ID,
    UNTAPPD_CLIENT_SECRET = _process$env.UNTAPPD_CLIENT_SECRET;

var UNTAPPD_API_ROOT = 'https://api.untappd.com/v4';
var authKeys = {
  client_id: UNTAPPD_CLIENT_ID,
  client_secret: UNTAPPD_CLIENT_SECRET
};

var AppError = function (_Error) {
  _inherits(AppError, _Error);

  function AppError(opts) {
    _classCallCheck(this, AppError);

    var _this = _possibleConstructorReturn(this, (AppError.__proto__ || Object.getPrototypeOf(AppError)).call(this, opts.message));

    _this.status = opts.status;
    return _this;
  }

  return AppError;
}(Error);

var getResults = function getResults(path, args, context) {
  var cache = context.cache || false;
  var rateLimitFor = 'app';
  var key = void 0;

  debugApi('getting results for %s args:%o', path, args);

  if (context.user && context.user.data.untappd) {
    debugApi('using client access_token for %s args:%o', path, args);
    var access_token = context.user.data.untappd;
    authKeys = {
      access_token: access_token
    };
    rateLimitFor = 'user ' + access_token.slice(8);
  }

  if (cache) {
    key = _crypto2.default.createHash('md5').update(JSON.stringify({ path: path, args: args })).digest('hex');
    var cachedResult = cache.get(key);
    if (cachedResult) {
      debugCache('using cached result for %s args:%o', path, args);
      return cachedResult;
    }
  }

  return _axios2.default.get(UNTAPPD_API_ROOT + '/' + path, { params: Object.assign({}, authKeys, args) }).bind(debugApi, debugCache).then(function (response) {
    var headers = response.headers,
        data = response.data;


    debugApi('x-ratelimit-remaining for %s: %d', rateLimitFor, headers['x-ratelimit-remaining']);
    //debugApi('API result: %O', data);

    if (cache) {
      debugCache('caching result for %s args:%o', path, args);
      cache.set(key, data);
    }

    return response;
  }).catch(function (error) {
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

    throw new AppError({ message: message, status: status });
  });
};

var resolvers = {
  Query: {
    brewerySearchInflated: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(root, args, context) {
        var _this2 = this;

        var res, _res$data$response, found, items;

        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return getResults('search/brewery', args, context);

              case 2:
                res = _context2.sent;
                _res$data$response = res.data.response, found = _res$data$response.found, items = _res$data$response.brewery.items;

                if (!(found === 0)) {
                  _context2.next = 6;
                  break;
                }

                return _context2.abrupt('return', undefined);

              case 6:
                return _context2.abrupt('return', items.map(function () {
                  var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(item) {
                    var brewery;
                    return regeneratorRuntime.wrap(function _callee$(_context) {
                      while (1) {
                        switch (_context.prev = _context.next) {
                          case 0:
                            brewery = item.brewery;
                            _context.next = 3;
                            return getResults('brewery/info/' + brewery.brewery_id, {}, context);

                          case 3:
                            res = _context.sent;
                            return _context.abrupt('return', res.data.response.brewery);

                          case 5:
                          case 'end':
                            return _context.stop();
                        }
                      }
                    }, _callee, _this2);
                  }));

                  return function (_x4) {
                    return _ref2.apply(this, arguments);
                  };
                }()));

              case 7:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function brewerySearchInflated(_x, _x2, _x3) {
        return _ref.apply(this, arguments);
      }

      return brewerySearchInflated;
    }(),
    brewerySearch: function () {
      var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(root, args, context) {
        var res, _res$data$response2, found, items;

        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return getResults('search/brewery', args, context);

              case 2:
                res = _context3.sent;
                _res$data$response2 = res.data.response, found = _res$data$response2.found, items = _res$data$response2.brewery.items;

                if (!(found === 0)) {
                  _context3.next = 6;
                  break;
                }

                return _context3.abrupt('return', undefined);

              case 6:
                return _context3.abrupt('return', items.map(function (item) {
                  return item.brewery;
                }));

              case 7:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function brewerySearch(_x5, _x6, _x7) {
        return _ref3.apply(this, arguments);
      }

      return brewerySearch;
    }(),
    breweryInfo: function () {
      var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(root, args, context) {
        var res;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return getResults('brewery/info/' + args.id, {}, context);

              case 2:
                res = _context4.sent;
                return _context4.abrupt('return', res.data.response.brewery);

              case 4:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function breweryInfo(_x8, _x9, _x10) {
        return _ref4.apply(this, arguments);
      }

      return breweryInfo;
    }()
  }
};

exports.default = resolvers;
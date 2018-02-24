'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _requestPromise = require('request-promise');

var _requestPromise2 = _interopRequireDefault(_requestPromise);

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var debug = require('debug')('untappd-graphql');
var info = require('debug')('untappd-graphql:info');

var _process$env = process.env,
    UNTAPPD_CLIENT_ID = _process$env.UNTAPPD_CLIENT_ID,
    UNTAPPD_CLIENT_SECRET = _process$env.UNTAPPD_CLIENT_SECRET;

var UNTAPPD_API_ROOT = 'https://api.untappd.com/v4';
var authKeys = {
  client_id: UNTAPPD_CLIENT_ID,
  client_secret: UNTAPPD_CLIENT_SECRET
};

var getResults = function getResults(path, args, context) {
  var cache = context.cache || false;
  var key = void 0;

  if (context.user && context.user.data.untappd) {
    debug('using client access_token for %s args:%o', path, args);
    authKeys = {
      access_token: context.user.data.untappd
    };
  }

  if (cache) {
    key = _crypto2.default.createHash('md5').update(JSON.stringify({ path: path, args: args })).digest('hex');
    var cachedResult = cache.get(key);
    if (cachedResult) {
      debug('using cached result for %s args:%o', path, args);
      return cachedResult;
    }
  }

  return (0, _requestPromise2.default)({
    uri: UNTAPPD_API_ROOT + '/' + path,
    qs: Object.assign({}, authKeys, args),
    json: true
  }).then(function (result) {
    var response = result.response;

    if (cache) {
      debug('caching result for %s args:%o', path, args);
      cache.set(key, response);
    }
    info('API response: %O', response);

    return response;
  }).catch(function (err) {
    debug('API error for %s args: %o: %s', path, args, err.message);
  });
};

var resolvers = {
  Query: {
    brewerySearchInflated: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(root, args, context) {
        var _this = this;

        var res, _res, found, items;

        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return getResults('search/brewery', args, context);

              case 2:
                res = _context2.sent;
                _res = res, found = _res.found, items = _res.brewery.items;

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
                            return _context.abrupt('return', res.brewery);

                          case 5:
                          case 'end':
                            return _context.stop();
                        }
                      }
                    }, _callee, _this);
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
        var res, found, brewery;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return getResults('search/brewery', args, context);

              case 2:
                res = _context3.sent;
                found = res.found, brewery = res.brewery;

                if (!(found === 0)) {
                  _context3.next = 6;
                  break;
                }

                return _context3.abrupt('return', undefined);

              case 6:
                return _context3.abrupt('return', brewery.items.map(function (item) {
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
    brewery: function () {
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
                return _context4.abrupt('return', res.brewery);

              case 4:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function brewery(_x8, _x9, _x10) {
        return _ref4.apply(this, arguments);
      }

      return brewery;
    }()
  }
};

exports.default = resolvers;
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

var _requestPromise = require('request-promise');

var _requestPromise2 = _interopRequireDefault(_requestPromise);

var _cache = require('./cache');

var _cache2 = _interopRequireDefault(_cache);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _process$env = process.env,
    UNTAPPD_CLIENT_ID = _process$env.UNTAPPD_CLIENT_ID,
    UNTAPPD_CLIENT_SECRET = _process$env.UNTAPPD_CLIENT_SECRET;

var authKeys = {
  client_id: UNTAPPD_CLIENT_ID,
  client_secret: UNTAPPD_CLIENT_SECRET
};

var cacheTTL = 60 * 60 * 24; // default ttl to one day

var GetBreweryInfo = function GetBreweryInfo(breweryId) {
  var key = _crypto2.default.createHash('md5').update(breweryId.toString()).digest('hex');
  var brewery = _cache2.default.get(key);

  if (brewery !== undefined) {
    return brewery;
  }

  return (0, _requestPromise2.default)({
    uri: 'https://api.untappd.com/v4/brewery/info/' + breweryId,
    qs: authKeys,
    json: true
  }).then(function (breweryInfoResult) {
    var breweryInfo = breweryInfoResult.response.brewery;
    _cache2.default.set(key, breweryInfo, cacheTTL);

    return breweryInfo;
  });
};

var resolvers = {
  Query: {
    brewerySearchInflated: function brewerySearchInflated(root, args) {
      var key = _crypto2.default.createHash('md5').update(JSON.stringify(args.q)).digest('hex');
      var breweryIdCached = _cache2.default.get(key);

      if (breweryIdCached !== undefined) {
        return GetBreweryInfo(breweryIdCached);
      }

      return (0, _requestPromise2.default)({
        uri: 'https://api.untappd.com/v4/search/brewery',
        qs: Object.assign({}, authKeys, args),
        json: true
      }).then(function (searchResult) {
        var _searchResult$respons = searchResult.response,
            found = _searchResult$respons.found,
            brewery = _searchResult$respons.brewery;


        if (found === 0) {
          return undefined;
        }

        var id = brewery.items[0].brewery.brewery_id;
        _cache2.default.set(key, id, cacheTTL);

        return GetBreweryInfo(id);
      });
    },
    brewerySearch: function brewerySearch(root, args) {
      return (0, _requestPromise2.default)({
        uri: 'https://api.untappd.com/v4/search/brewery',
        qs: Object.assign({}, authKeys, args),
        json: true
      }).then(function (result) {
        return result.response.brewery.items.map(function (item) {
          return item.brewery;
        });
      });
    },
    brewery: function brewery(root, args) {
      return (0, _requestPromise2.default)({
        uri: 'https://api.untappd.com/v4/brewery/info/' + args.id,
        qs: authKeys,
        json: true
      }).then(function (result) {
        return result.response.brewery;
      });
    }
  }
};

exports.default = resolvers;
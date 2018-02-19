'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _requestPromise = require('request-promise');

var _requestPromise2 = _interopRequireDefault(_requestPromise);

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var debug = require('debug')('untappd-graphql');

var _process$env = process.env,
    UNTAPPD_CLIENT_ID = _process$env.UNTAPPD_CLIENT_ID,
    UNTAPPD_CLIENT_SECRET = _process$env.UNTAPPD_CLIENT_SECRET;

var authKeys = {
  client_id: UNTAPPD_CLIENT_ID,
  client_secret: UNTAPPD_CLIENT_SECRET
};

var GetBreweryInfo = function GetBreweryInfo(breweryId, cache) {
  var key = _crypto2.default.createHash('md5').update(JSON.stringify(breweryId)).digest('hex');

  if (cache) {
    var breweryInfo = cache.get(key);

    if (breweryInfo) {
      debug('GetBreweryInfo: returning cached info %O', breweryInfo);
      return breweryInfo;
    }
  }

  return (0, _requestPromise2.default)({
    uri: 'https://api.untappd.com/v4/brewery/info/' + breweryId,
    qs: authKeys,
    json: true
  }).then(function (breweryInfoResult) {
    var breweryInfo = breweryInfoResult.response.brewery;

    if (cache) {
      debug('GetBreweryInfo: caching info %O', breweryInfo);
      cache.set(key, breweryInfo);
    }

    return breweryInfo;
  });
};

var resolvers = {
  Query: {
    brewerySearchInflated: function brewerySearchInflated(root, args, context) {
      if (context.user && context.user.data.untappd) {
        debug('brewerySearchInflated: using client access_token');
        authKeys = {
          access_token: context.user.data.untappd
        };
      }

      var cache = context.cache || false;

      if (cache) {
        var key = _crypto2.default.createHash('md5').update(JSON.stringify(args.q)).digest('hex');
        var breweryId = cache.get(key);

        if (breweryId) {
          debug('brewerySearchInflated: returning cached search result %O', breweryId);
          return GetBreweryInfo(breweryId, authKeys, context.cache);
        }
      }

      return (0, _requestPromise2.default)({
        uri: 'https://api.untappd.com/v4/search/brewery',
        qs: Object.assign({}, authKeys, args, context),
        json: true
      }).then(function (searchResult) {
        var _searchResult$respons = searchResult.response,
            found = _searchResult$respons.found,
            brewery = _searchResult$respons.brewery;


        if (found === 0) {
          return undefined;
        }

        var id = brewery.items[0].brewery.brewery_id;
        if (cache) {
          var _key = _crypto2.default.createHash('md5').update(JSON.stringify(args.q)).digest('hex');
          debug('brewerySearchInflated: caching search result %O', id);
          cache.set(_key, id);
        }

        return GetBreweryInfo(id, cache);
      });
    },
    brewerySearch: function brewerySearch(root, args, context) {
      if (context.user.data.untappd) {
        authKeys = {
          access_token: context.user.data.untappd
        };
      }

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
      return GetBreweryInfo(args.id);
    }
  }
};

exports.default = resolvers;
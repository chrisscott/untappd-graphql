import rp from 'request-promise';
import crypto from 'crypto';

const debugCache = require('debug')('untappd-graphql:cache');
const debugApi = require('debug')('untappd-graphql:api');

const { UNTAPPD_CLIENT_ID, UNTAPPD_CLIENT_SECRET } = process.env;
const UNTAPPD_API_ROOT = 'https://api.untappd.com/v4';
let authKeys = {
  client_id: UNTAPPD_CLIENT_ID,
  client_secret: UNTAPPD_CLIENT_SECRET,
};

const getResults = (path, args, context) => {
  const cache = context.cache || false;
  let rateLimitFor = 'app';
  let key;

  if (context.user && context.user.data.untappd) {
    debugCache('using client access_token for %s args:%o', path, args);
    const access_token = context.user.data.untappd;
    authKeys = {
      access_token,
    };
    rateLimitFor = `user ${access_token.slice(8)}`;
  }

  if (cache) {
    key = crypto.createHash('md5').update(JSON.stringify({ path, args })).digest('hex');
    const cachedResult = cache.get(key);
    if (cachedResult) {
      debugCache('using cached result for %s args:%o', path, args);
      return cachedResult;
    }
  }

  return rp({
    uri: `${UNTAPPD_API_ROOT}/${path}`,
    qs: Object.assign({}, authKeys, args),
    json: true,
    resolveWithFullResponse: true,
  }).then((result) => {
    const { headers, body: { response } } = result;

    debugApi('x-ratelimit-limit for %s: %d', rateLimitFor, headers['x-ratelimit-limit']);
    debugApi('x-ratelimit-remaining for %s: %d', rateLimitFor, headers['x-ratelimit-remaining']);

    if (cache) {
      debugCache('caching result for %s args:%o', path, args);
      cache.set(key, response);
    }
    debugApi('API result: %O', response);

    return response;
  }).catch((err) => {
    debugApi('API error for %s args: %o: %s', path, args, err.message);
  });
};

const resolvers = {
  Query: {
    async brewerySearchInflated(root, args, context) {
      let res = await getResults('search/brewery', args, context);
      const { found, brewery: { items } } = res;

      if (found === 0) {
        return undefined;
      }

      return items.map(async (item) => {
        const { brewery } = item;
        res = await getResults(`brewery/info/${brewery.brewery_id}`, {}, context);
        return res.brewery;
      });
    },
    async brewerySearch(root, args, context) {
      const res = await getResults('search/brewery', args, context);
      const { found, brewery } = res;

      if (found === 0) {
        return undefined;
      }

      return brewery.items.map(item => item.brewery);
    },
    async brewery(root, args, context) {
      const res = await getResults(`brewery/info/${args.id}`, {}, context);

      return res.brewery;
    },
  },
};

export default resolvers;

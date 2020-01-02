import axios from 'axios';
import crypto from 'crypto';
import Promise from 'bluebird';

global.Promise = Promise;

const debugCache = require('debug')('untappd-graphql:cache');
const debugApi = require('debug')('untappd-graphql:api');
const debugApiVerbose = require('debug')('untappd-graphql:api:verbose');

const { UNTAPPD_CLIENT_ID, UNTAPPD_CLIENT_SECRET } = process.env;
const UNTAPPD_API_ROOT = 'https://api.untappd.com/v4';
let authKeys = {
  client_id: UNTAPPD_CLIENT_ID,
  client_secret: UNTAPPD_CLIENT_SECRET,
};

class AppError extends Error {
  constructor(opts) {
    super(opts.message);
    this.status = opts.status;
  }
}

const getResults = (path, args, context) => {
  const cache = context.cache || false;
  let rateLimitFor = 'app';
  let key;

  debugApi('getting results for %s args:%o', path, args);

  if (context.user && context.user.data.untappd) {
    debugApi('using client access_token for %s args:%o', path, args);
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

  return axios.get(
    `${UNTAPPD_API_ROOT}/${path}`,
    { params: Object.assign({}, authKeys, args) },
  )
    .bind(debugApi, debugCache, debugApiVerbose).then((response) => {
      const { headers, data } = response;

      debugApi('x-ratelimit-remaining for %s: %d', rateLimitFor, headers['x-ratelimit-remaining']);
      debugApi('received result for %s args:%o', path, args);
      debugApiVerbose('API result: %O', data);

      if (headers['x-ratelimit-remaining'] === 0) {
        debugApi('rate limit met, returning with no data');
        return {found: 0};
      }

      if (cache) {
        debugCache('caching result for %s args:%o', path, args);
        cache.set(key, data);
      }

      return data;
    })
    .catch((error) => {
      const { response: { data, status, headers } } = error;

      debugApi('x-ratelimit-remaining for %s: %d', rateLimitFor, headers['x-ratelimit-remaining']);
      debugApi('API error: %s', error);

      let message = data;

      if (data.meta) {
        message = data.meta.error_detail;
      }

      throw new AppError({ message, status });
    });
};

const resolvers = {
  Query: {
    async brewerySearchInflated(root, args, context) {
      let res = await getResults('search/brewery', args, context);
      const { found, brewery: { items = [] } } = res.response;

      if (found === 0) {
        return undefined;
      }

      return items.map(async (item) => {
        const { brewery } = item;
        res = await getResults(`brewery/info/${brewery.brewery_id}`, {}, context);
        return res.response.brewery;
      });
    },
    async brewerySearch(root, args, context) {
      const res = await getResults('search/brewery', args, context);
      const { found, brewery: { items } } = res.response;

      if (found === 0) {
        return undefined;
      }

      return items.map(item => item.brewery);
    },
    async breweryInfo(root, args, context) {
      const res = await getResults(`brewery/info/${args.id}`, {}, context);
      return res.response.brewery;
    },
  },
};

export default resolvers;

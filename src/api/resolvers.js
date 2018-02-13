import crypto from 'crypto';
import rp from 'request-promise';
import cache from './cache';

const { UNTAPPD_CLIENT_ID, UNTAPPD_CLIENT_SECRET } = process.env;
const authKeys = {
  client_id: UNTAPPD_CLIENT_ID,
  client_secret: UNTAPPD_CLIENT_SECRET,
};

const GetBreweryInfo = breweryId =>
  rp({
    uri: `https://api.untappd.com/v4/brewery/info/${breweryId}`,
    qs: authKeys,
    json: true,
  }).then((breweryInfoResult) => {
    const breweryInfo = breweryInfoResult.response.brewery;

    return breweryInfo;
  });

const resolvers = {
  Query: {
    brewerySearchInflated(root, args) {
      return rp({
        uri: 'https://api.untappd.com/v4/search/brewery',
        qs: Object.assign({}, authKeys, args),
        json: true,
      }).then((searchResult) => {
        const { found, brewery } = searchResult.response;

        if (found === 0) {
          return undefined;
        }

        const id = brewery.items[0].brewery.brewery_id;

        return GetBreweryInfo(id);
      });
    },
    brewerySearch(root, args) {
      return rp({
        uri: 'https://api.untappd.com/v4/search/brewery',
        qs: Object.assign({}, authKeys, args),
        json: true,
      }).then(result => result.response.brewery.items.map(item => item.brewery));
    },
    brewery(root, args) {
      return rp({
        uri: `https://api.untappd.com/v4/brewery/info/${args.id}`,
        qs: authKeys,
        json: true,
      }).then(result => result.response.brewery);
    },
  },
};

export default resolvers;

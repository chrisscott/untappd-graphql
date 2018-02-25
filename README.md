# GraphQL for the Untappd API

`npm install https://github.com/chrisscott/untappd-graphql.git`

## Features

* __a GraphQL server__ that delegates to the [Untappd API](https://untappd.com/api/)
* __caching__ of Untappd API results
* exports for __[schema stitching](https://www.apollographql.com/docs/graphql-tools/schema-stitching.html)__ into your project

## Prerequisites

You will need an approved [Untappd API](https://untappd.com/api/) app and the following information from the app's settings:

* Client ID
* Client Secret

## API Endpoints Implemented

The following are currently implemented as GraphQL Queries. If you'd like to see others, please add an issue (or, even better, submit a PR that implements them).

* [Brewery Search](https://untappd.com/api/docs#brewerysearch) (`brewerySearch`)
* [Brewery Info](https://untappd.com/api/docs#breweryinfo) (`brewery`)

### Enhancements

The following Queries have been added for convenience:

* `brewerySearchInflated`: the results of `brewerySearch` inflated with `brewery`. Note that this still requires an API call for every brewery returned by `brewerySearch`. If you plan on using this, you should cache the results.

## Running the GraphQL server

### Requirements

The following environment variables must be set:

* `UNTAPPD_CLIENT_ID`: the Client ID from your Untappd app
* `UNTAPPD_CLIENT_SECRET`: the Client Secret from your Untappd app
* `JWT_SECRET` (optional): if you are using user [authentication](https://untappd.com/api/docs#authentication) (see below) this secret is used to encrypt and decrypt the JSON web token used to store the authenticated user's Untappd `access_token`. This secret will need to be the same used in the app calling the API.

### Running the Server

`npm start`

This will run the following endpoints on the `PORT` environment variable if defined (or `9090` if not) on the local host.

* `/graphql`: the GraphQL server
* `/graphiql` in non-production environments: the GraphiQL interface


## Caching

To cache the API results from Untappd pass in a `cache` object as a property of `context` that supports the following function signatures (such as [`node-cache`](https://www.npmjs.com/package/node-cache)):

* `get(key)`
* `set(key, value)`

__Caching is recommended, especially if using the `brewerySearchInflated` Query since it requires one API call for the search and one for each `Brewery` returned.__

For an example using `node-cache` as an in-memory cache with `apollo-server-express` see [`server.js`](./server.js).

## User Authentication

To use an Untappd user's API limits instead of your app's limits, you can [authenticate](https://untappd.com/api/docs#authentication) the user and pass their `access_token` to the API.

To do this, set an `authorization` header using Bearer auth with a JSON Web Token when calling the GraphQL server. The token *must* have following format and be encrypted with the `JWT_SECRET` noted above:

```
const access_token = ... // access_token from server- or client-side authentication of the user to Untappd
{
  data: {
    untappd: access_token,
  },
},
```

For example, using `jsonwebtoken` to create the JWT in the app calling the GraphQL endpoint:

```
import jsonwebtoken from 'jsonwebtoken';

const jwt = jsonwebtoken.sign(
  {
    data: {
      untappd: access_token,
    },
  },
  process.env.JWT_SECRET,
);

const header = `authorization: Bearer ${jwt}`;

// then pass the authorization header when calling the GraphQL endpoint
...do request, process results, etc...
```

## Schema Stitching

This module exports the following for use in your GraphQL project:

* Type definitions: `typeDefs`
* Resolvers: `resolvers`
* An executable schema: `schema`

For example, you could use the following in your own GraphQL server (see [`server.js`](./server.js) for usage):

```
import { typeDefs as untappdTypeDefs, resolvers as untappdResolvers } from 'untappd-graphql';

const untappdExecutableSchema = makeExecutableSchema({
  typeDefs: untappdTypeDefs,
  resolvers: untappdResolvers,
});
```

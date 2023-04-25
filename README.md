# GraphQL for the Untappd API

`npm install untappd-graphql`

## Features

* __a GraphQL server__ that delegates to the [Untappd API](https://untappd.com/api/)
* optional __caching__ of Untappd API results
* exports for __use in your own project__

## Prerequisites

You will need an approved [Untappd API](https://untappd.com/api/) app and the following information from the app's settings:

* Client ID
* Client Secret

## API Endpoints Implemented

The following are currently implemented. If you'd like to see others, please add an issue (or, even better, submit a PR that implements them).

### Queries

#### Info / Search

* [Brewery Search](https://untappd.com/api/docs#brewerysearch) - (`brewerySearch`)
 * A convenience query, `brewerySearchInflated`, provides the results of `brewerySearch` inflated with `breweryInfo` for each brewery returned by `brewerySearch`. Since this requires an API call for every brewery you should use caching if using this.
* [Brewery Info](https://untappd.com/api/docs#breweryinfo) - (`breweryInfo`)

## Running the GraphQL server

### Configuration

The following environment variables must be set:

* `UNTAPPD_CLIENT_ID`: the Client ID from your Untappd app
* `UNTAPPD_CLIENT_SECRET`: the Client Secret from your Untappd app

### Running the Example Server

`npm start`

This will run the `/graphql` endpoint on localhost on the `PORT` environment variable, if defined (defaults to `9090`). In non-production environments, the GraphQL Playground interface will run here too.

In-memory caching (see below) is enabled on the example server.

Test query:
```
{
  brewerySearch(q: "Inefficient Prohibitions") {
    brewery_id
    brewery_name
  }
}
```

## User Authentication

To use an Untappd user's API limits instead of your app's limits, you can [authenticate](https://untappd.com/api/docs#authentication) the user and pass their `access_token` to the API.

To do this, set `user.data.untappd` on the `context` property to the user's Untappd access token when creating the GraphQL server. 

## Using in Your Own Project

This module exports the following for use in your GraphQL project:

* Type definitions: `typeDefs`
* Resolvers: `resolvers`
* An executable schema: `schema`

For example, you could use the `typeDefs` and `resolvers` to make an executable schema for you own GraphQL server (see [`server.js`](./server.js)) or for [schema stitching](https://www.apollographql.com/docs/graphql-tools/schema-stitching.html) it with another schema.

### Caching

To cache the API results from Untappd pass in a `cache` object as a property of `context` when creating the GraphQL server. The cache must support the following function signatures (such as [`node-cache`](https://www.npmjs.com/package/node-cache)):

* `get(key)`
* `set(key, value)`

__Caching is recommended, especially if using the `brewerySearchInflated` Query since it requires one API call for the search and one for each `Brewery` returned.__

For an example using `node-cache` as an in-memory cache with `apollo-server-express` see [`example-server.js`](./example-server.js).

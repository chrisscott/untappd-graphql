import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import NodeCache from 'node-cache';
import { schema } from './src';

const debug = require('debug')('untappd-graphql');

const port = process.env.PORT || 9090;

if (!process.env.UNTAPPD_CLIENT_ID || !process.env.UNTAPPD_CLIENT_SECRET) {
  debug('UNTAPPD_CLIENT_ID and UNTAPPD_CLIENT_SECRET must be set in env.');
  process.exit(1);
}

async function startServer() {
  // Cache in memory
  const context = {
    cache: new NodeCache({
      stdTTL: 60 * 60 * 24 * 7, // cache for one week
    }),
  };

  const server = new ApolloServer({
    schema,
    context,
    formatError: (err) => {
      const { status, message } = err.originalError;
      return { status, message };
    },
  });

  const app = express();
  await server.start();
  server.applyMiddleware({ app });

  // Start the server
  await new Promise((resolve) => app.listen({ port }, resolve));
  console.log(`🚀 Server ready at http://localhost:${port}${server.graphqlPath}`);
  debug(`Go to http://localhost:${port}/graphiql to run queries!`);
}

startServer();

import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express5';
import http from 'http';
import cors from 'cors';
import { json } from 'body-parser';
import NodeCache from 'node-cache';
import { schema } from './src';

const debug = require('debug')('untappd-graphql');

debug.enabled = true;

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
    formatError: (formattedError, err) => {
      if (err && err.originalError) {
        const { status, message } = err.originalError;
        return { status, message };
      }
      return formattedError;
    },
  });

  const app = express();
  const httpServer = http.createServer(app);
  await server.start();
  app.use(
    '/graphql',
    cors(),
    json(),
    expressMiddleware(server, {
      context: async () => context,
    }),
  );

  // Start the server
  // eslint-disable-next-line no-promise-executor-return
  await new Promise((resolve) => httpServer.listen({ port }, resolve));
  debug(`🚀 Server ready at http://localhost:${port}/graphql`);
}

startServer();

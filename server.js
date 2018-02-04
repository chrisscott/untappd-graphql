import express from 'express';
import bodyParser from 'body-parser';
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import schema from './src';

const port = process.env.PORT || 9090;

if (!process.env.UNTAPPD_CLIENT_ID || !process.env.UNTAPPD_CLIENT_SECRET) {
  console.log('UNTAPPD_CLIENT_ID and UNTAPPD_CLIENT_SECRET must be set in env.');
  process.exit(1);
}

// Initialize the app
const app = express();

// The GraphQL endpoint
app.use('/graphql', bodyParser.json(), graphqlExpress({ schema }));

// GraphiQL, a visual editor for queries
app.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }));

// Start the server
app.listen(port, () => {
  console.log(`Go to http://localhost:${port}/graphiql to run queries!`);
});

import { ApolloClient, InMemoryCache } from '@apollo/client';

const client = new ApolloClient({
  uri: process.env.SUBGRAPH_URL,
  cache: new InMemoryCache(),
});

export { client };

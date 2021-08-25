import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { App } from './App';
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
} from "@apollo/client";
// this is default client 
const client = new ApolloClient({
  uri: process.env.ANALITYCS_SUBGRAPH_URL,
  cache: new InMemoryCache()
});

// this client will be used for another api on another network 
export const client_2 = new ApolloClient({
  uri: process.env.ANALITYCS_SUBGRAPH_URL,
  cache: new InMemoryCache()
});

ReactDOM.render(
    <ApolloProvider client={client}>
        <App />
    </ApolloProvider>
    , document.getElementById('root') as HTMLElement);

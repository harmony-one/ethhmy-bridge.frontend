import {
  ApolloClient,
  InMemoryCache,
} from "@apollo/client";

// this client will be used for another api on eth network
let client_eth = undefined
if(
  process.env.ANALITYCS_SUBGRAPH_URL_ETH !== '' && process.env.ANALITYCS_SUBGRAPH_URL_ETH !== undefined){

 client_eth = new ApolloClient({
  uri: process.env.ANALITYCS_SUBGRAPH_URL_ETH,
  cache: new InMemoryCache()
});
  }

let client_bsc = undefined
if(
  process.env.ANALITYCS_SUBGRAPH_URL_BSC !== '' && process.env.ANALITYCS_SUBGRAPH_URL_BSC !== undefined){

 client_bsc = new ApolloClient({
  uri: process.env.ANALITYCS_SUBGRAPH_URL_BSC,
  cache: new InMemoryCache()
});
  }



export {client_eth, client_bsc}
import gql from 'graphql-tag';

export const STATS_QUERY = gql`
  query stats {
    stats: wallet(id: "0x0c1310bbd93c6977fde20dc813cff8236ba1f0dd") {
      id
      usersCount
      assetsCount
      eventsCount
      dayData(orderBy: date, orderDirection: desc, first: 2) {
        id
        date
        newUsersCount
        newAssetsCount
        eventsCount
      }
    }
  }
`;

export const DAILY_STATS_QUERY = gql`
  query dailyStats {
    stats: wallet(id: "0x0c1310bbd93c6977fde20dc813cff8236ba1f0dd") {
      dayData(orderBy: date, orderDirection: desc, first: 100) {
        id
        date
        usersCount
        newUsersCount
        assetsCount
        newAssetsCount
        transactionsCount
        eventsCount
      }
    }
  }
`;

export const DAILY_TOKENS_STATS = gql`
  query dailyAssetsStats {
    assets(first: 200) {
      id
      network
      mappedAddress
      eventsCount
      symbol
      name
      ... on BridgedToken {
        decimals
        volume
        totalLocked
        dayData(orderBy: date, orderDirection: desc, first: 60) {
          date
          volume
          totalLocked
          eventsCount
        }
      }
      ... on Token {
        decimals
        volume
        totalLocked
        dayData(orderBy: date, orderDirection: desc, first: 60) {
          date
          volume
          totalLocked
          eventsCount
        }
      }
    }
  }
`;

export const DAILY_ASSET_STATS = gql`
  query dailyAssetsStats($id: ID!) {
    asset(id: $id) {
      id
      symbol
      ... on BridgedToken {
        decimals
        volume
        totalLocked
        dayData(orderBy: date, orderDirection: desc, first: 60) {
          date
          volume
          totalLocked
          eventsCount
        }
      }
      ... on Token {
        decimals
        volume
        totalLocked
        dayData(orderBy: date, orderDirection: desc, first: 60) {
          date
          volume
          totalLocked
          eventsCount
        }
      }
    }
  }
`;

export const TOKEN_EVENTS = gql`
  query dailyAssetsStats($id: ID!, $first: Int!, $skip: Int!) {
    events(
      where: { asset: $id }
      orderBy: timestamp
      orderDirection: desc
      first: $first
      skip: $skip
    ) {
      id
      type
      timestamp
      blockNumber
      txHash
      ... on Mint {
        amount
        recipient
        receiptId
      }
      ... on Burn {
        amount
        sender
        recipient
      }
      ... on Lock {
        amount
        sender
        recipient
      }
      ... on Unlock {
        amount
        recipient
        receiptId
      }
    }
  }
`;

export const ASSET_STATS = gql`
  query assetStats($id: ID!) {
    asset(id: $id) {
      id
      symbol
      name
      network
      type: __typename
      mappedAddress
      eventsCount
      ... on BridgedToken {
        decimals
        volume
        totalLocked
        dayData(orderBy: date, orderDirection: desc, first: 60) {
          date
          volume
          eventsCount
          mintsCount
          burnsCount
          totalLocked
        }
      }
      ... on Token {
        decimals
        volume
        totalLocked
        dayData(orderBy: date, orderDirection: desc, first: 60) {
          date
          volume
          eventsCount
          locksCount
          unlocksCount
          totalLocked
        }
      }
    }
  }
`;

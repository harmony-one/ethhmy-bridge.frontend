import gql from 'graphql-tag';
import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';
import { BigNumber } from '@ethersproject/bignumber';
import fetch from 'node-fetch';
import { formatEther, parseEther } from '@ethersproject/units';
import express from 'express';

const client = new ApolloClient({
  link: new HttpLink({
    uri: 'http://127.0.0.1:8000/subgraphs/name/bmgalego/bridge-subgraph',
    fetch,
  }),
  cache: new InMemoryCache(),
});

const ASSETS_QUERY = gql`
  query assets {
    assets(first: 200) {
      id
      symbol
      name
      mappedAddress
      network
      type: __typename
      ... on BridgedToken {
        decimals
        totalLocked
        dayData(orderBy: date, orderDirection: desc, first: 1) {
          date
          volume
        }
      }
      ... on Token {
        decimals
        totalLocked
        dayData(orderBy: date, orderDirection: desc, first: 1) {
          date
          volume
        }
      }
    }
  }
`;

const ASSET_QUERY = gql`
  query asset($id: ID!) {
    asset(id: $id) {
      id
      symbol
      name
      network
      type: __typename
      mappedAddress
      ... on BridgedToken {
        decimals
        totalLocked
      }
      ... on Token {
        decimals
        totalLocked
      }
    }
  }
`;

const ASSETS_TOTAL_LOCKED_QUERY = gql`
  query assets {
    assets(first: 200) {
      id
      symbol
      name
      mappedAddress
      type: __typename
      ... on BridgedToken {
        decimals
        totalLocked
        dayData(orderBy: date, orderDirection: desc, first: 60) {
          date
          totalLocked
        }
      }
      ... on Token {
        decimals
        totalLocked
        dayData(orderBy: date, orderDirection: desc, first: 60) {
          date
          totalLocked
        }
      }
    }
  }
`;

const ASSET_TOTAL_LOCKED_QUERY = gql`
  query asset($id: ID!) {
    asset(id: $id) {
      id
      symbol
      name
      mappedAddress
      type: __typename
      ... on BridgedToken {
        decimals
        dayData(orderBy: date, orderDirection: desc, first: 60) {
          date
          totalLocked
        }
      }
      ... on Token {
        decimals
        dayData(orderBy: date, orderDirection: desc, first: 60) {
          date
          totalLocked
        }
      }
    }
  }
`;

const ASSETS_VOLUME_QUERY = gql`
  query assets {
    assets {
      id
      symbol
      name
      mappedAddress
      type: __typename
      ... on BridgedToken {
        decimals
        dayData(orderBy: date, orderDirection: desc, first: 60) {
          date
          volume
        }
      }
      ... on Token {
        decimals
        dayData(orderBy: date, orderDirection: desc, first: 60) {
          date
          volume
        }
      }
    }
  }
`;

const ASSET_VOLUME_QUERY = gql`
  query asset($id: ID!) {
    asset(id: $id) {
      id
      symbol
      name
      mappedAddress
      type: __typename
      ... on BridgedToken {
        decimals
        dayData(orderBy: date, orderDirection: desc, first: 60) {
          date
          volume
        }
      }
      ... on Token {
        decimals
        dayData(orderBy: date, orderDirection: desc, first: 60) {
          date
          volume
        }
      }
    }
  }
`;

async function fetchPrices(date) {
  const res = await fetch(
    `https://be4.bridge.hmny.io/tokens-history?date=${date}`,
    {},
  );

  return await res.json();
}

const day = 60 * 60 * 24;
const days = 2;
const port = 8888;

async function main() {
  const today = Math.floor(Date.now() / (day * 1000)) * day;
  const prices = new Map<number, Map<string, BigNumber>>();

  for (let date = today - days * day; date <= today; date = date + day) {
    console.log(date);
    const dailyPrices = await fetchPrices(date * 1000);

    const assetPricesEntries = dailyPrices
      .map(({ hrc20Address, usdPrice, symbol }) => {
        let id = hrc20Address.toLowerCase();
        if (id === '0x00eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') {
          id = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
        }

        let price: BigNumber;

        try {
          price = parseEther(String(usdPrice));
        } catch (error) {
          price = BigNumber.from(0);
        }

        return [id, price];
      })
      .sort((a, b) => (a[1].gt(b[1]) ? 1 : -1));

    prices.set(date, new Map<string, BigNumber>(assetPricesEntries));
  }

  const app = express();

  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, PUT, PATCH, POST, DELETE');
    res.header(
      'Access-Control-Allow-Headers',
      req.header('access-control-request-headers'),
    );
    next();
  });

  app.use(async (req, res, next) => {
    console.log('updating prices');
    const today = Math.floor(Date.now() / (day * 1000)) * day;
    const todayPrices = await fetchPrices(today * 1000);

    const assetPricesEntries = todayPrices
      .map(({ hrc20Address, usdPrice, symbol }) => {
        let id = hrc20Address.toLowerCase();
        if (id === '0x00eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') {
          id = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
        }

        let price: BigNumber;

        try {
          price = parseEther(String(usdPrice));
        } catch (error) {
          price = BigNumber.from(0);
        }

        return [id, price];
      })
      .sort((a, b) => (a[1].gt(b[1]) ? 1 : -1));

    prices.set(today, new Map<string, BigNumber>(assetPricesEntries));

    next();
  });

  app.get('/prices', function(req, res) {
    res.json(
      Object.fromEntries(
        Array.from(prices.entries()).map(([date, dailyPrices]) => [
          date,
          Object.fromEntries(
            Array.from(dailyPrices.entries()).map(([id, price]) => [
              id,
              formatEther(price),
            ]),
          ),
        ]),
      ),
    );
  });

  app.get('/assets', async function(req, res) {
    const today = Math.floor(Date.now() / (day * 1000)) * day;

    const { data } = await client.query({
      query: ASSETS_QUERY,
    });

    const dailyPrices = prices.get(today);

    let tvl = BigNumber.from(0);

    const assets = [];
    for (const { dayData, ...asset } of data.assets) {
      if (asset.type === 'BridgedToken' || asset.type === 'Token') {
        const price = dailyPrices.has(asset.id)
          ? dailyPrices.get(asset.id)
          : BigNumber.from(0);

        const assetTvl = BigNumber.from(asset.totalLocked)
          .mul(price)
          .div(BigNumber.from(10).pow(asset.decimals));

        assets.push({
          ...asset,
          volume: dayData[0]?.volume, // check date
          price: price.toString(),
          tvl: assetTvl.toString(),
        });
        tvl = tvl.add(assetTvl);
      } else {
        assets.push(asset);
      }
    }

    res.json({
      tvl: tvl.toString(),
      assets,
    });
  });

  app.get('/assets/:asset', async function(req, res) {
    const today = Math.floor(Date.now() / (day * 1000)) * day;

    const { data } = await client.query({
      query: ASSET_QUERY,
      variables: {
        id: req.params.asset,
      },
    });

    const dailyPrices = prices.get(today);

    let tvl = BigNumber.from(0);

    const asset = { ...data.asset };

    if (asset.type === 'BridgedToken' || asset.type === 'Token') {
      const price = dailyPrices.has(asset.id)
        ? dailyPrices.get(asset.id)
        : BigNumber.from(0);

      const assetTvl = BigNumber.from(asset.totalLocked)
        .mul(price)
        .div(BigNumber.from(10).pow(asset.decimals));

      asset.price = price.toString();
      asset.tvl = assetTvl.toString();
    }

    res.json({ asset });
  });

  app.get('/charts/tvl', async function(req, res) {
    const stats = await client.query({
      query: ASSETS_TOTAL_LOCKED_QUERY,
    });

    const {
      data: { assets },
    } = stats;

    const assetsTotalLockedByDate = new Map<string, Map<number, BigNumber>>();

    for (const asset of assets) {
      if (asset.type === 'BridgedToken' || asset.type === 'Token') {
        const totalLockedByDay = new Map(
          asset.dayData
            .map(({ date, totalLocked }) => [date, totalLocked])
            .reverse(),
        );

        const assetTotalLockedByDate = new Map();

        let totalLocked = BigNumber.from(0);
        for (let date = today - 60 * day; date <= today; date = date + day) {
          if (totalLockedByDay.has(date)) {
            totalLocked = BigNumber.from(totalLockedByDay.get(date));
          }
          assetTotalLockedByDate.set(date, totalLocked);
        }

        assetsTotalLockedByDate.set(asset.id, assetTotalLockedByDate);
      }
    }
    const tvlByDay = new Map<number, BigNumber>();
    for (let date = today - days * day; date <= today; date = date + day) {
      let tvl = BigNumber.from(0);
      const dailyPrices = prices.get(date);
      for (const asset of assets) {
        if (asset.type === 'BridgedToken' || asset.type === 'Token') {
          const decimals = BigNumber.from(10).pow(asset.decimals);
          if (dailyPrices.has(asset.id.toLowerCase())) {
            const locked = assetsTotalLockedByDate
              .get(asset.id.toLowerCase())
              .get(date);

            if (locked && locked.gt(0)) {
              const assetTvl = locked
                .mul(dailyPrices.get(asset.id.toLowerCase()))
                .div(decimals);

              tvl = tvl.add(assetTvl);
            }
          }
        }
      }
      tvlByDay.set(date, tvl);
    }

    res.json(
      Array.from(tvlByDay.entries()).map(([date, tvl]) => [
        date,
        tvl.toString(),
      ]),
    );
  });

  app.get('/charts/volume', async function(req, res) {
    const stats = await client.query({
      query: ASSETS_VOLUME_QUERY,
    });

    const {
      data: { assets },
    } = stats;

    const assetsVolumeByDate = new Map<string, Map<number, BigNumber>>();

    for (const asset of assets) {
      if (asset.type === 'BridgedToken' || asset.type === 'Token') {
        assetsVolumeByDate.set(
          asset.id.toLowerCase(),
          new Map<number, BigNumber>(
            asset.dayData
              .map(({ date, volume }) => [date, BigNumber.from(volume)])
              .reverse(),
          ),
        );
      }
    }

    const volumeValueByDay = new Map<number, BigNumber>();
    for (let date = today - days * day; date <= today; date = date + day) {
      let totalVolumeValue = BigNumber.from(0);
      const dailyPrices = prices.get(date);
      for (const asset of assets) {
        if (asset.type === 'BridgedToken' || asset.type === 'Token') {
          const decimals = BigNumber.from(10).pow(asset.decimals);
          if (dailyPrices.has(asset.id.toLowerCase())) {
            const volume = assetsVolumeByDate
              .get(asset.id.toLowerCase())
              .get(date);

            if (volume && volume.gt(0)) {
              const assetVolume = volume
                .mul(dailyPrices.get(asset.id.toLowerCase()))
                .div(decimals);

              totalVolumeValue = totalVolumeValue.add(assetVolume);
            }
          }
        }
      }
      volumeValueByDay.set(date, totalVolumeValue);
    }

    res.json(
      Array.from(volumeValueByDay.entries()).map(([date, volume]) => [
        date,
        volume.toString(),
      ]),
    );
  });

  app.get('/charts/:asset/tvl', async function(req, res) {
    const stats = await client.query({
      query: ASSET_TOTAL_LOCKED_QUERY,
      variables: {
        id: req.params.asset,
      },
    });

    const {
      data: { asset },
    } = stats;

    const assetTotalLockedByDate = new Map();

    if (asset.type === 'BridgedToken' || asset.type === 'Token') {
      const totalLockedByDay = new Map(
        asset.dayData
          .map(({ date, totalLocked }) => [date, totalLocked])
          .reverse(),
      );

      let totalLocked = BigNumber.from(0);
      for (let date = today - 60 * day; date <= today; date = date + day) {
        if (totalLockedByDay.has(date)) {
          totalLocked = BigNumber.from(totalLockedByDay.get(date));
        }
        assetTotalLockedByDate.set(date, totalLocked);
      }
    }

    const tvlByDay = new Map<number, BigNumber>();
    for (let date = today - days * day; date <= today; date = date + day) {
      let tvl = BigNumber.from(0);
      const dailyPrices = prices.get(date);
      const decimals = BigNumber.from(10).pow(asset.decimals);
      if (dailyPrices.has(asset.id.toLowerCase())) {
        const locked = assetTotalLockedByDate.get(date);

        if (locked && locked.gt(0)) {
          const assetTvl = locked
            .mul(dailyPrices.get(asset.id.toLowerCase()))
            .div(decimals);

          tvl = tvl.add(assetTvl);
        }
      }
      tvlByDay.set(date, tvl);
    }

    res.json(
      Array.from(tvlByDay.entries()).map(([date, tvl]) => [
        date,
        tvl.toString(),
      ]),
    );
  });

  app.get('/charts/:asset/volume', async function(req, res) {
    const stats = await client.query({
      query: ASSET_VOLUME_QUERY,
      variables: {
        id: req.params.asset,
      },
    });

    const {
      data: { asset },
    } = stats;

    const assetVolumeByDate = new Map<number, BigNumber>(
      asset.dayData
        .map(({ date, volume }) => [date, BigNumber.from(volume)])
        .reverse(),
    );

    const volumeValueByDay = new Map<number, BigNumber>();
    for (let date = today - days * day; date <= today; date = date + day) {
      let volumeValue = BigNumber.from(0);
      const volume = assetVolumeByDate.get(date);
      const dailyPrices = prices.get(date);
      const decimals = BigNumber.from(10).pow(asset.decimals);
      if (dailyPrices.has(asset.id.toLowerCase())) {
        if (volume && volume.gt(0)) {
          volumeValue = volume
            .mul(dailyPrices.get(asset.id.toLowerCase()))
            .div(decimals);
        }
      }
      volumeValueByDay.set(date, volumeValue);
    }

    res.json(
      Array.from(volumeValueByDay.entries()).map(([date, volume]) => [
        date,
        volume.toString(),
      ]),
    );
  });

  app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
  });
}

main();

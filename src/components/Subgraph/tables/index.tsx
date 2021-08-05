import Table from 'rc-table';
import React, { useState, useEffect } from 'react';
import { useQuery, gql, QueryResult } from '@apollo/client';
import { SubgraphTableComponentProp } from '../../../interfaces/subgraphTypes';
import { Spinner } from 'ui';
import { Box, Card } from 'grommet';
import { Button } from 'components/Base';
import { NETWORK_ICON, NETWORK_NAME } from '../../../stores/names';
import { NETWORK_TYPE } from 'stores/interfaces';
import { SearchInput } from 'components/Search';

const columns = [
  {
    title: 'Symbol',
    dataIndex: 'symbol',
    key: 'symbol',
    width: 100,
  },
  {
    title: 'Transaction Count',
    dataIndex: 'eventsCount',
    key: 'eventsCount',
    width: 100,
  },
];

// const data = [{ symbol: 'Jack', eventsCount: 28 }];

export function SubGraphQueryTable(props: SubgraphTableComponentProp) {
  const data = [];
  const [network, setNetwork] = useState(NETWORK_TYPE.ETHEREUM);
  const [search, setSearch] = useState('');
  // console.log('table is rendered');

  let q = props.query.replace(/%\w+%/g, network);
  const queryResult: QueryResult = useQuery(
    gql`
      ${q}
    `,
  );
  if (queryResult.data != undefined && !queryResult.loading) {
    for (let i in queryResult.data) {
      let baseData = queryResult.data[i];
      for (let j in baseData) {
        let currentItem = baseData[j];
        let symbol = currentItem.symbol.replace(1, '').replace('bsc', '');
        let searchTest = (
          search
            .toUpperCase()
            .match(new RegExp('[' + symbol.toUpperCase() + ']', 'g')) || []
        ).join('');
        if (search !== '' && searchTest.length > 0) {
          data.push({
            key: i + j,
            symbol: symbol,
            eventsCount: currentItem.eventsCount,
          });
        } else if (search === '') {
          data.push({
            key: i + j,
            symbol: symbol,
            eventsCount: currentItem.eventsCount,
          });
        }
      }
    }
  }
  if (queryResult.loading) {
    return (
      <div>
        <Box direction="column" margin={{ top: 'large', bottom: 'large' }}>
          <Box direction="row" justify="start" gap="10px">
            <SearchInput value={''} onChange={() => {}} />
            <Button
              style={{
                background: 'white',
                border:
                  network === NETWORK_TYPE.BINANCE
                    ? '2px solid #00ADE8'
                    : '2px solid rgba(0,0,0,0)',
                color: '#212e5e',
              }}
            >
              <img
                style={{ marginRight: 10, height: 20 }}
                src={NETWORK_ICON[NETWORK_TYPE.BINANCE]}
              />
              {NETWORK_NAME[NETWORK_TYPE.BINANCE]}
            </Button>
            <Button
              style={{
                background: 'white',
                border:
                  network === NETWORK_TYPE.ETHEREUM
                    ? '2px solid #00ADE8'
                    : '2px solid rgba(0,0,0,0)',
                color: '#212e5e',
              }}
            >
              <img
                style={{ marginRight: 10, height: 20 }}
                src={NETWORK_ICON[NETWORK_TYPE.ETHEREUM]}
              />
              {NETWORK_NAME[NETWORK_TYPE.ETHEREUM]}
            </Button>
          </Box>
        </Box>
        <Spinner />
      </div>
    );
  }
  function handleNetworkChange(type: NETWORK_TYPE) {
    setNetwork(type);
  }

  return (
    <div>
      <Box direction="column" margin={{ top: 'large', bottom: 'large' }}>
        <Box direction="row" justify="start" gap="10px">
          <SearchInput value={search} onChange={setSearch} />
          <Button
            style={{
              background: 'white',
              border:
                network === NETWORK_TYPE.BINANCE
                  ? '2px solid #00ADE8'
                  : '2px solid rgba(0,0,0,0)',
              color: '#212e5e',
            }}
            onClick={() => handleNetworkChange(NETWORK_TYPE.BINANCE)}
          >
            <img
              style={{ marginRight: 10, height: 20 }}
              src={NETWORK_ICON[NETWORK_TYPE.BINANCE]}
            />
            {NETWORK_NAME[NETWORK_TYPE.BINANCE]}
          </Button>
          <Button
            style={{
              background: 'white',
              border:
                network === NETWORK_TYPE.ETHEREUM
                  ? '2px solid #00ADE8'
                  : '2px solid rgba(0,0,0,0)',
              color: '#212e5e',
            }}
            onClick={() => handleNetworkChange(NETWORK_TYPE.ETHEREUM)}
          >
            <img
              style={{ marginRight: 10, height: 20 }}
              src={NETWORK_ICON[NETWORK_TYPE.ETHEREUM]}
            />
            {NETWORK_NAME[NETWORK_TYPE.ETHEREUM]}
          </Button>
        </Box>
      </Box>
      <Table columns={columns} data={data} />
    </div>
  );
}

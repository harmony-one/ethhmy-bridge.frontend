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
import { formatWithTwoDecimals, truncateAddressString } from 'utils';
import { getChecksumAddress } from '../../../blockchain-bridge';
import * as styles from './styles.styl';

const EthAddress = ({
  value,
  network,
}: {
  value: string;
  network: NETWORK_TYPE;
}) => {
  return (
    <Box
      direction="row"
      justify="start"
      align="center"
      style={{ marginTop: 4 }}
    >
      <img
        className={styles.imgToken}
        style={{ height: 20 }}
        src={NETWORK_ICON[network]}
      />
      <a
        className={styles.addressLink}
        href={`https://kovan.etherscan.io/token/${value}`}
        target="_blank"
      >
        {truncateAddressString(value, 10)}
      </a>
    </Box>
  );
};

const oneAddress = value => (
  <Box direction="row" justify="start" align="center" style={{ marginTop: 4 }}>
    <img className={styles.imgToken} style={{ height: 18 }} src="/one.svg" />
    <a
      className={styles.addressLink}
      href={`${process.env.HMY_EXPLORER_URL}/address/${value}?txType=hrc20`}
      target="_blank"
    >
      {truncateAddressString(value, 10)}
    </a>
  </Box>
);

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
  {
    title: 'ERC20 Address',
    key: 'address',
    dataIndex: 'address',
    width: 280,
    render: value => (
      <EthAddress value={value.address} network={value.network} />
    ),
  },
  {
    title: 'HRC20 Address',
    key: 'hrc20Address',
    dataIndex: 'hrc20Address',
    width: 300,
    render: value => {
      const address =
        String(value).toLowerCase() ===
        String(process.env.ONE_HRC20).toLowerCase()
          ? String(value).toLowerCase()
          : getChecksumAddress(value);

      return oneAddress(address);
    },
  },
  {
    title: 'Total Asset Bridged',
    // sortable: true,
    key: 'tab',
    dataIndex: 'tab',
    width: 140,
    render: data => (
      <Box direction="column" justify="center">
        {formatWithTwoDecimals(calculateTAB(data.symbol, data.value, data.moreInfo))}
      </Box>
    ),
    // className: styles.centerHeader,
    // align: 'center',
  },
  {
    title: 'Total Asset Bridged USD',
    sortable: true,
    key: 'tabUSD',
    defaultSort: 'asc',
    dataIndex: 'tabUSD',
    width: 210,
    className: styles.rightHeaderSort,
    render: data => (
      <Box direction="column" justify="center" pad={{ right: 'medium' }}>
        ${formatWithTwoDecimals(calculateTABUSD(data.symbol, data.value, data.moreInfo))}
      </Box>
    ),
  },
];

function calculateTAB(symbol, value, more) {
  if(more != undefined)
    return value / Math.pow(10, parseInt(more.decimals));
  return ''
}
function calculateTABUSD(symbol, value, more) {
  if(more != undefined)
    return (value / Math.pow(10, parseInt(more.decimals))) * parseFloat(more.price);
  return ''
}
// const data = [{ symbol: 'Jack', eventsCount: 28 }];
type ComplementaryData = {
  isLoaded: boolean;
  success: boolean;
  items: {};
};

export function SubGraphQueryTable(props: SubgraphTableComponentProp) {
  const data = [];
  const [network, setNetwork] = useState(NETWORK_TYPE.ETHEREUM);
  const [search, setSearch] = useState('');
  const [complementaryData, setComplementaryData] = useState(
    {} as ComplementaryData,
  );

  React.useEffect(function effectFunction() {
    async function fetchComplementaryData() {
      const response = await fetch(
        'https://be4.bridge.hmny.io/tokens/?page=0&size=1000',
      );
      if (response && response.status == 200) {
        const res: any = await response.json();
        const result = res.content;
    
        let symbolsDecimal = {};
        for (let index in result) {
          let currentData = result[index];
          let currentDataSymbol = currentData.symbol.replace(1, '').replace('bsc', '');
          if(! (currentDataSymbol in symbolsDecimal)){
            symbolsDecimal[currentDataSymbol] = {
              decimals: currentData.decimals,
              price: currentData.usdPrice
            }
          }
        }

        setComplementaryData({
          isLoaded: true,
          success: true,
          items: symbolsDecimal,
        });
      } else {
        setComplementaryData({
          isLoaded: true,
          success: false,
          items: [],
        });
      }
    }
    fetchComplementaryData();
  }, []);
  // this is different than fetch so it is not included in useEffect
  let q = props.query.replace(/%\w+%/g, network);
  const queryResult: QueryResult = useQuery(
    gql`
      ${q}
    `,
  );
  if (queryResult.data != undefined && !queryResult.loading && complementaryData.success) {
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
            address: { network: network, address: currentItem.mappedAddress },
            hrc20Address: currentItem.address,
            tab: { value: currentItem.totalLocked, symbol: symbol, moreInfo: complementaryData.items[symbol] },
            tabUSD: { value: currentItem.totalLocked, symbol: symbol, moreInfo: complementaryData.items[symbol] },
            eventsCount: currentItem.eventsCount,
          });
        } else if (search === '') {
          data.push({
            key: i + j,
            symbol: symbol,
            address: { network: network, address: currentItem.mappedAddress },
            hrc20Address: currentItem.address,
            tab: { value: currentItem.totalLocked, symbol: symbol, moreInfo: complementaryData.items[symbol] },
            tabUSD: { value: currentItem.totalLocked, symbol: symbol, moreInfo: complementaryData.items[symbol] },
            eventsCount: currentItem.eventsCount,
          });
        }
      }
    }
  }
  
  if (queryResult.loading && complementaryData.isLoaded) {
    return (
      <div>
        <Box
          direction="column"
          fill={true}
          justify="center"
          alignContent="center"
          align="center"
          margin={{ top: 'large', bottom: 'large' }}
        >
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
        <Box
          direction="column"
          fill={true}
          justify="center"
          alignContent="center"
          align="center"
        >
          <Spinner />
        </Box>
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

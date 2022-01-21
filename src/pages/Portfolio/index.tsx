import * as React from 'react';
import { useEffect, useState } from 'react';
import { Box } from 'grommet';
import { BaseContainer, PageContainer } from 'components';
import utils from 'web3-utils';
import { observer } from 'mobx-react-lite';
import { useStores } from 'stores';
import { IColumn, Table } from 'components/Table';
import { ITokenInfo, NETWORK_TYPE, TOKEN } from 'stores/interfaces';
import {
  formatWithTwoDecimals,
  formatZeroDecimals,
  truncateAddressString,
} from 'utils';
import * as styles from './styles.styl';
import { Select, Text, Title } from 'components/Base';
import { SearchInput } from 'components/Search';
import { getBech32Address, getChecksumAddress } from '../../blockchain-bridge';
import { NETWORK_ICON } from '../../stores/names';
import { NetworkButton } from './Components';
// import { AddTokenIcon } from '../../ui/AddToken';
import { useMediaQuery } from 'react-responsive';

const EthAddress = observer(
  ({ value, network }: { value: string; network: NETWORK_TYPE }) => {
    const { exchange } = useStores();

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
          href={`${exchange.getExplorerByNetwork(network)}/token/${value}`}
          target="_blank"
        >
          {truncateAddressString(value, 10)}
        </a>
      </Box>
    );
  },
);

const oneAddress = value => (
  <Box direction="row" justify="start" align="center" style={{ marginTop: 4 }}>
    <img className={styles.imgToken} style={{ height: 18 }} src="/one.svg" />
    <a
      className={styles.addressLink}
      href={`${process.env.HMY_EXPLORER_URL}/address/${value}?activeTab=3`}
      target="_blank"
    >
      {truncateAddressString(value, 10)}
    </a>
  </Box>
);

const getAssetAddress = (data, type: 'origin' | 'mapping') => {
  let assetPrefix;
  switch (type) {
    case 'origin':
      assetPrefix = 'erc';
      break;
    case 'mapping':
      assetPrefix = 'hrc';
      break;
  }

  if (data.type.indexOf(assetPrefix) !== -1) {
    return <EthAddress value={data.erc20Address} network={data.network} />;
  } else {
    const address =
      String(data.hrc20Address).toLowerCase() ===
      String(process.env.ONE_HRC20).toLowerCase()
        ? String(data.hrc20Address).toLowerCase()
        : getChecksumAddress(data.hrc20Address);

    return oneAddress(address);
  }
};

const getAssetBalance = (data, type: 'origin' | 'mapping') => {
  let assetPrefix;
  switch (type) {
    case 'origin':
      assetPrefix = 'erc';
      break;
    case 'mapping':
      assetPrefix = 'hrc';
      break;
  }

  if (data.type.indexOf(assetPrefix) !== -1) {
    return data.erc20Balance;
  } else {
    return data.hrc20Balance;
  }
};

const getColumns = ({ hmyLINKBalanceManager }): IColumn<ITokenInfo>[] => [
  {
    title: 'Symbol',
    key: 'symbol',
    dataIndex: 'symbol',
    width: 140,
    className: styles.leftHeader,
    render: (value, data) => (
      <Box direction="row" justify="start" pad={{ left: 'medium' }}>
        {value ? value.toUpperCase() : '--'}
        {/*<AddTokenIcon {...data} />*/}
      </Box>
    ),
  },
  {
    title: 'Name',
    key: 'name',
    dataIndex: 'name',
    width: 160,
  },
  {
    title: 'Type',
    key: 'type',
    dataIndex: 'type',
    width: 100,
    render: (value, data) => (
      <Box direction="row" justify="start">
        {value.toUpperCase()}
      </Box>
    ),
  },
  {
    title: 'Origin Address',
    key: 'erc20Address',
    dataIndex: 'erc20Address',
    width: 280,
    render: (value, data) => {
      return (
        <div>
          {getAssetAddress(data, 'origin')}
          {utils.fromWei(getAssetBalance(data, 'origin') || '0')}
        </div>
      );
    },
  },
  {
    title: 'Mapping Address',
    key: 'hrc20Address',
    dataIndex: 'hrc20Address',
    width: 280,
    render: (value, data) => {
      return (
        <div>
          {getAssetAddress(data, 'mapping')}
          {utils.fromWei(getAssetBalance(data, 'mapping') || '0')}
        </div>
      );
    },
  },
  // {
  //   title: 'Decimals',
  //   key: 'decimals',
  //   dataIndex: 'decimals',
  //   width: 100,
  //   className: styles.centerHeader,
  //   align: 'center',
  // },
  {
    title: 'Total Locked',
    // sortable: true,
    key: 'totalLockedNormal',
    dataIndex: 'totalLockedNormal',
    width: 140,
    render: value => (
      <Box direction="column" justify="center">
        {formatWithTwoDecimals(value)}
      </Box>
    ),
    // className: styles.centerHeader,
    // align: 'center',
  },
  {
    title: 'Total Locked USD',
    sortable: true,
    key: 'totalLockedUSD',
    defaultSort: 'asc',
    dataIndex: 'totalLockedUSD',
    width: 200,
    className: styles.rightHeaderSort,
    align: 'right',
    render: (value, data) => {
      let lockedMoney;
      if (data.type.indexOf('721') !== -1 || data.type.indexOf('1155') !== -1) {
        lockedMoney = '-';
      } else {
        lockedMoney = '$' + formatWithTwoDecimals(value);
      }
      return (
        <Box direction="column" justify="center" pad={{ right: 'medium' }}>
          {lockedMoney}
        </Box>
      );
    },
  },
];

export const Portfolio = observer((props: any) => {
  const { tokens, user, userMetamask, portfolio } = useStores();
  const [search, setSearch] = useState('');
  const [network, setNetwork] = useState<NETWORK_TYPE | 'ALL'>('ALL');
  const [tokenType, setToken] = useState<TOKEN | 'ALL'>('ALL');

  const [columns, setColumns] = useState(getColumns(user));
  const isMobile = useMediaQuery({ query: '(max-width: 600px)' });

  useEffect(() => {
    tokens.selectedNetwork = network === 'ALL' ? undefined : network;
  }, [network]);

  const loadUserOperations = async () => {
    await tokens.init();
    await tokens.fetch();

    // const ethAddress = '0x3998b67218d591758c1704b1c4fa1a87abeeb443';
    // const oneAddress = '0x3998b67218d591758c1704b1c4fa1a87abeeb443';
    const ethAddress = userMetamask.ethAddress;
    const oneAddress = user.address;

    await portfolio.loadOperationList(ethAddress, oneAddress);
  };

  useEffect(() => {
    loadUserOperations();
  }, []);

  useEffect(() => {
    setColumns(getColumns(user));
  }, [user.hmyLINKBalanceManager]);

  const onChangeDataFlow = (props: any) => {
    tokens.onChangeDataFlow(props);
  };

  const lastUpdateAgo = Math.ceil((Date.now() - tokens.lastUpdateTime) / 1000);

  const filteredData = portfolio.tokens.filter(token => {
    // if (
    //   (token.type === 'erc20' || token.type === 'hrc20') &&
    //   !Number(token.totalSupply)
    // ) {
    //   return false;
    // }

    let iSearchOk = true;
    let isNetworkOk = true;
    let isTokenOk = true;

    if (search) {
      iSearchOk =
        Object.values(token).some(
          value =>
            value &&
            value
              .toString()
              .toLowerCase()
              .includes(search.toLowerCase()),
        ) ||
        getBech32Address(token.hrc20Address).toLowerCase() ===
          search.toLowerCase();
    }

    if (network !== 'ALL') {
      isNetworkOk = token.network === network;
    }

    if (tokenType !== 'ALL') {
      isTokenOk = token.type === tokenType;
    }

    return iSearchOk && isNetworkOk && isTokenOk;
  });

  return (
    <BaseContainer>
      <PageContainer>
        {!isMobile ? (
          <Box
            pad={{ horizontal: '9px' }}
            margin={{ top: 'medium', bottom: 'medium' }}
            // style={{ maxWidth: 500 }}
            direction={isMobile ? 'column' : 'row'}
            justify="between"
            align={isMobile ? 'start' : 'end'}
            gap="40px"
          >
            <SearchInput value={search} onChange={setSearch} />
            <Box direction="row" gap="10px" align="end">
              <NetworkButton
                type={'ALL'}
                selectedType={network}
                onClick={() => setNetwork('ALL')}
              />
              <NetworkButton
                type={NETWORK_TYPE.BINANCE}
                selectedType={network}
                onClick={() => setNetwork(NETWORK_TYPE.BINANCE)}
              />
              <NetworkButton
                type={NETWORK_TYPE.ETHEREUM}
                selectedType={network}
                onClick={() => setNetwork(NETWORK_TYPE.ETHEREUM)}
              />
              <Box direction="column" style={{ width: 300 }} gap="5px">
                <Text>Token:</Text>
                <Select
                  size="full"
                  value={tokenType}
                  options={[
                    { text: 'ALL', value: 'ALL' },
                    { text: 'ERC20', value: TOKEN.ERC20 },
                    { text: 'HRC20', value: TOKEN.HRC20 },
                    { text: 'ERC721', value: TOKEN.ERC721 },
                    { text: 'ERC1155', value: TOKEN.ERC1155 },
                    { text: 'HRC721', value: TOKEN.HRC721 },
                    { text: 'HRC1155', value: TOKEN.HRC1155 },
                  ]}
                  onChange={setToken}
                />
              </Box>
            </Box>
          </Box>
        ) : (
          <Box
            direction="row"
            gap="10px"
            align="start"
            margin={{ top: '20px', bottom: '10px' }}
          >
            <NetworkButton
              type={'ALL'}
              selectedType={network}
              onClick={() => setNetwork('ALL')}
            />
            <NetworkButton
              type={NETWORK_TYPE.BINANCE}
              selectedType={network}
              onClick={() => setNetwork(NETWORK_TYPE.BINANCE)}
            />
            <NetworkButton
              type={NETWORK_TYPE.ETHEREUM}
              selectedType={network}
              onClick={() => setNetwork(NETWORK_TYPE.ETHEREUM)}
            />
          </Box>
        )}

        <Box
          direction="row"
          wrap={true}
          fill={true}
          justify="center"
          align="start"
        >
          <Table
            data={filteredData}
            columns={columns}
            isPending={tokens.isPending}
            hidePagination={true}
            dataLayerConfig={tokens.dataFlow}
            onChangeDataFlow={onChangeDataFlow}
            onRowClicked={() => {}}
          />
        </Box>
      </PageContainer>
    </BaseContainer>
  );
});

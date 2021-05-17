import * as React from 'react';
import { useEffect, useState } from 'react';
import { Box } from 'grommet';
import { BaseContainer, PageContainer } from 'components';
import { observer } from 'mobx-react-lite';
import { useStores } from 'stores';
import { IColumn, Table } from 'components/Table';
import {
  EXCHANGE_MODE,
  ITokenInfo,
  NETWORK_TYPE,
  TOKEN,
} from 'stores/interfaces';
import { formatWithTwoDecimals, truncateAddressString } from 'utils';
import * as styles from './styles.styl';
import { Select, Text, Title } from 'components/Base';
import { SearchInput } from 'components/Search';
import { getBech32Address, getChecksumAddress } from '../../blockchain-bridge';
import { NETWORK_ICON } from '../../stores/names';
import { NetworkButton } from './Components';
// import { AddTokenIcon } from '../../ui/AddToken';

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
      href={`${process.env.HMY_EXPLORER_URL}/address/${value}?txType=hrc20`}
      target="_blank"
    >
      {truncateAddressString(value, 10)}
    </a>
  </Box>
);

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
    title: 'ERC20 Address',
    key: 'erc20Address',
    dataIndex: 'erc20Address',
    width: 280,
    render: (value, data) => (
      <EthAddress value={value} network={data.network} />
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
    width: 210,
    className: styles.rightHeaderSort,
    align: 'right',
    render: value => (
      <Box direction="column" justify="center" pad={{ right: 'medium' }}>
        ${formatWithTwoDecimals(value)}
      </Box>
    ),
  },
];

export const Tokens = observer((props: any) => {
  const { tokens, user } = useStores();
  const [search, setSearch] = useState('');
  const [network, setNetwork] = useState<NETWORK_TYPE | 'ALL'>('ALL');
  const [tokenType, setToken] = useState<TOKEN | 'ALL'>('ALL');

  const [columns, setColumns] = useState(getColumns(user));

  useEffect(() => {
    tokens.selectedNetwork = network === 'ALL' ? undefined : network;
  }, [network]);

  useEffect(() => {
    tokens.init();
    tokens.fetch();
  }, []);

  useEffect(() => {
    setColumns(getColumns(user));
  }, [user.hmyLINKBalanceManager]);

  const onChangeDataFlow = (props: any) => {
    tokens.onChangeDataFlow(props);
  };

  const lastUpdateAgo = Math.ceil((Date.now() - tokens.lastUpdateTime) / 1000);

  const filteredData = tokens.data.filter(token => {
    if (!Number(token.totalSupply)) {
      return false;
    }

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
        <Box
          direction="row"
          justify="between"
          align="center"
          margin={{ top: 'medium' }}
          pad={{ horizontal: 'medium' }}
        >
          <Title>Bridged Assets</Title>

          <Box direction="column">
            <Title size="small">
              Total Value Locked (USD){' '}
              <span
                style={{
                  marginLeft: 5,
                  color: '#47b8eb',
                  fontWeight: 600,
                  letterSpacing: 0.2,
                }}
              >
                ${formatWithTwoDecimals(tokens.totalLockedUSD)}
              </span>
            </Title>
          </Box>

          <Text>{`Last update: ${lastUpdateAgo}sec ago`}</Text>
        </Box>

        <Box
          pad={{ horizontal: '9px' }}
          margin={{ top: 'medium', bottom: 'medium' }}
          // style={{ maxWidth: 500 }}
          direction="row"
          justify="between"
          align="end"
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
                options={[
                  { text: 'ALL', value: 'ALL' },
                  { text: 'ERC20', value: TOKEN.ERC20 },
                  { text: 'HRC20', value: TOKEN.HRC20 },
                  { text: 'ERC721', value: TOKEN.ERC721 },
                ]}
                onChange={setToken}
              />
            </Box>
          </Box>
        </Box>

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

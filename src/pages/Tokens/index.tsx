import * as React from 'react';
import { useEffect, useState } from 'react';
import { Box, Grid } from 'grommet';
import { observer } from 'mobx-react-lite';
import { useStores } from 'stores';
import { IColumn, Table } from 'components/Table';
import { ITokenInfo, NETWORK_TYPE, TOKEN } from 'stores/interfaces';
import { formatWithTwoDecimals, truncateAddressString } from 'utils';
import * as styles from './styles.styl';
import { Text } from 'components/Base';
import { SearchInput } from 'components/Search';
import { getBech32Address, getChecksumAddress } from '../../blockchain-bridge';
import { NETWORK_ICON } from '../../stores/names';
import { useMediaQuery } from 'react-responsive';
import { LayoutCommon } from '../../components/Layouts/LayoutCommon/LayoutCommon';
import { FilterTokenType } from './components/FilterTokenType/FilterTokenType';
import { FilterNetworkType } from './components/FilterNetworkType/FilterNetworkType';
import { TokensHeader } from './components/TokensHeader/TokensHeader';
import styled from 'styled-components';

const TRUNCATE_ADDRESS = 6;

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
          {truncateAddressString(value, TRUNCATE_ADDRESS)}
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
      {truncateAddressString(value, TRUNCATE_ADDRESS)}
    </a>
  </Box>
);

const getAssetAddress = (data: ITokenInfo, type) => {
  /*
  token type        | type    | address       | component
  ---               | ---     | ---           |
  token.erc         | origin  | erc20Address  | EthAddress
  token.hrc         | origin  | hrc20Address  | HrcAddress
  token.erc         | mapping | hrc20Address  | HrcAddress
  token.hrc         | mapping | erc20Address  | EthAddress
   */
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

const StyledGrid = styled(Grid)`
  //grid-template-columns: auto auto auto auto;
  grid-template-areas: 'total total total total' 'filters filters filters filters' 'search search select select';

  row-gap: 12px;
  column-gap: 12px;

  @media (min-width: 850px) {
    //grid-template-columns: auto auto auto auto;
    grid-template-areas: 'total total total total' 'search search filters select';
    justify-content: space-between;
  }

  @media (min-width: 1150px) {
    //grid-template-columns: auto auto auto auto;
    grid-template-areas: 'total search filters select';
    justify-content: space-between;
  }
`;

const getColumns = ({ hmyLINKBalanceManager }): IColumn<ITokenInfo>[] => [
  {
    title: 'Symbol',
    key: 'symbol',
    dataIndex: 'symbol',
    width: 180,
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
    render: (value, data) => (
      <Text size="xxsmall" color="NGray">
        {value}
      </Text>
    ),
  },
  {
    title: 'Type',
    key: 'type',
    dataIndex: 'type',
    width: 100,
    render: (value, data) => (
      <Text size="xxsmall" color="NGray">
        {value.toUpperCase()}
      </Text>
    ),
  },
  {
    title: 'Origin Address',
    key: 'erc20Address',
    dataIndex: 'erc20Address',
    width: 180,
    render: (value, data) => getAssetAddress(data, 'origin'),
  },
  {
    title: 'Mapping Address',
    key: 'hrc20Address',
    dataIndex: 'hrc20Address',
    width: 180,
    render: (value, data) => getAssetAddress(data, 'mapping'),
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

export const Tokens = observer((props: any) => {
  const { tokens, user } = useStores();
  const [search, setSearch] = useState('');
  const [network, setNetwork] = useState<NETWORK_TYPE | 'ALL'>('ALL');
  const [tokenType, setToken] = useState<TOKEN | 'ALL'>('ALL');

  const [columns, setColumns] = useState(getColumns(user));
  const isMobile = useMediaQuery({ query: '(max-width: 600px)' });

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

  const filteredData = tokens.allData.filter(token => {
    if (
      (token.type === 'erc20' || token.type === 'hrc20') &&
      !Number(token.totalSupply)
    ) {
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
    <LayoutCommon>
      {/*<Box*/}
      {/*  direction={isMobile ? 'column' : 'row'}*/}
      {/*  justify="between"*/}
      {/*  align={isMobile ? 'start' : 'center'}*/}
      {/*  margin={{ top: 'medium' }}*/}
      {/*  pad={{ horizontal: 'medium' }}*/}
      {/*>*/}
      {/*  <Title>Bridged Assets</Title>*/}

      {/*  <Box direction="column">*/}
      {/*    <Title size="small">*/}
      {/*      Total Value Locked (USD){' '}*/}
      {/*      <span*/}
      {/*        style={{*/}
      {/*          marginLeft: 5,*/}
      {/*          color: '#47b8eb',*/}
      {/*          fontWeight: 600,*/}
      {/*          letterSpacing: 0.2,*/}
      {/*        }}*/}
      {/*      >*/}
      {/*        ${formatZeroDecimals(tokens.totalLockedUSD)}*/}
      {/*      </span>*/}
      {/*    </Title>*/}
      {/*  </Box>*/}

      {/*  <Text>{`Last update: ${lastUpdateAgo}sec ago`}</Text>*/}
      {/*</Box>*/}

      <StyledGrid pad={{ vertical: '24px' }} fill="horizontal">
        <Box gridArea="total">
          <TokensHeader
            lastUpdate={lastUpdateAgo}
            totalLocked={tokens.totalLockedUSD}
          />
        </Box>

        <Box direction="column" gridArea="search" justify="end">
          <Text
            color="NGray4"
            style={{ fontSize: '10px', marginBottom: '8px' }}
          >
            SEARCH TOKEN
          </Text>
          <SearchInput value={search} onChange={setSearch} />
        </Box>
        <Box gridArea="filters" justify="end">
          <FilterNetworkType network={network} setNetwork={setNetwork} />
        </Box>
        <Box gridArea="select" justify="end">
          <FilterTokenType tokenType={tokenType} setToken={setToken} />
        </Box>
      </StyledGrid>

      <Box
        direction="row"
        wrap={true}
        fill="horizontal"
        justify="center"
        align="start"
      >
        {isMobile ? (
          <Table
            data={filteredData}
            columns={columns}
            isPending={tokens.isPending}
            hidePagination={true}
            dataLayerConfig={tokens.dataFlow}
            onChangeDataFlow={onChangeDataFlow}
            onRowClicked={() => {}}
            customItem={{
              bodyStyle: {
                // padding: '0px 20px',
              },
              dir: 'column',
              render: props => {
                const data = props.params as ITokenInfo;

                const hrc20Address =
                  String(data.hrc20Address).toLowerCase() ===
                  String(process.env.ONE_HRC20).toLowerCase()
                    ? String(data.hrc20Address).toLowerCase()
                    : getChecksumAddress(data.hrc20Address);

                return (
                  <Box
                    style={{
                      width: 'calc(100vw - 20px)',
                      overflow: 'hidden',
                      borderRadius: '5px',
                      background: '#1B1B1C',
                    }}
                    direction="column"
                    pad="medium"
                    margin={{ top: '15px' }}
                    gap="5px"
                  >
                    <Text bold={true}>
                      {data.name} ({data.symbol})
                    </Text>
                    <Text>HRC20 Address: {oneAddress(hrc20Address)}</Text>
                    <Text>
                      ERC20 Address:{' '}
                      <EthAddress
                        value={data.erc20Address}
                        network={data.network}
                      />
                    </Text>
                    <Text>
                      Total Locked USD: $
                      {formatWithTwoDecimals(data.totalLockedUSD)}
                    </Text>
                  </Box>
                ) as any;
              },
            }}
          />
        ) : (
          <Table
            data={filteredData}
            columns={columns}
            isPending={tokens.isPending}
            hidePagination={true}
            dataLayerConfig={tokens.dataFlow}
            onChangeDataFlow={onChangeDataFlow}
            onRowClicked={() => {}}
          />
        )}
      </Box>
    </LayoutCommon>
  );
});

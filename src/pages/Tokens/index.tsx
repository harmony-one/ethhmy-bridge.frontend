import * as React from 'react';
import { useEffect, useState } from 'react';
import { Box } from 'grommet';
import { BaseContainer, PageContainer } from 'components';
import { observer } from 'mobx-react-lite';
import { useStores } from 'stores';
import { IColumn, Table } from 'components/Table';
import { ITokenInfo } from 'stores/interfaces';
import {
  dateTimeAgoFormat,
  divDecimals,
  formatWithTwoDecimals,
  truncateAddressString,
} from 'utils';
import * as styles from './styles.styl';
import { Title, Text } from 'components/Base';
import { SearchInput } from 'components/Search';
import { getScrtAddress } from '../../blockchain-bridge';

const ethAddress = value => (
  <Box direction="row" justify="start" align="center" style={{ marginTop: 4 }}>
    <img className={styles.imgToken} style={{ height: 20 }} src="/eth.svg" />
    <a
      className={styles.addressLink}
      href={`${process.env.ETH_EXPLORER_URL}/token/${value}`}
      target="_blank"
    >
      {truncateAddressString(value, 10)}
    </a>
  </Box>
);

const secretContractAddress = value => (
  <Box direction="row" justify="start" align="center" style={{ marginTop: 4 }}>
    <img className={styles.imgToken} style={{ height: 18 }} src="/scrt.svg" />
    <a
      className={styles.addressLink}
      href={`${process.env.SCRT_EXPLORER_URL}/contracts/${value}`}
      target="_blank"
    >
      {truncateAddressString(value, 10)}
    </a>
  </Box>
);

// todo: handle multiple networks
const getColumns = (): IColumn<ITokenInfo>[] => [
  {
    title: 'Symbol',
    key: 'symbol',
    dataIndex: 'symbol',
    width: 140,
    className: styles.leftHeader,
    render: value => {
      return (
        <Box direction="column" justify="center" pad={{ left: 'medium' }}>
          {value}
        </Box>
      );
    },
  },
  {
    title: 'Name',
    key: 'name',
    dataIndex: 'name',
    width: 160,
  },
  {
    title: 'Ethereum Address',
    key: 'src_address',
    dataIndex: 'src_address',
    width: 280,
    render: value => (value === 'native' ? 'native' : ethAddress(value)),
  },
  {
    title: 'Secret Network Address',
    key: 'dst_address',
    dataIndex: 'dst_address',
    width: 300,
    render: value => secretContractAddress(getScrtAddress(value)),
  },
  {
    title: 'Decimals',
    key: 'decimals',
    dataIndex: 'decimals',
    width: 100,
    className: styles.centerHeader,
    align: 'center',
  },
  {
    title: 'Total Locked',
    sortable: true,
    key: 'totalLocked',
    dataIndex: 'totalLocked',
    width: 140,
    render: value => (
      <Box direction="column" justify="center">
        {value}
      </Box>
    ),
    className: styles.centerHeader,
    align: 'center',
  },
];

export const Tokens = observer((props: any) => {
  const { tokens } = useStores();
  const [search, setSearch] = useState('');

  const [columns, setColumns] = useState(getColumns());

  useEffect(() => {
    tokens.init({ sorters: {}, sorter: 'none' });
    tokens.fetch();
  }, []);

  const onChangeDataFlow = (props: any) => {
    tokens.onChangeDataFlow(props);
  };

  const lastUpdateAgo = Math.ceil((Date.now() - tokens.lastUpdateTime) / 1000);

  const filteredData = tokens.data
    .filter(token => {
      if (search) {
        // todo: check dst_network
        return (
          Object.values(token).some(
            value =>
              value &&
              value
                .toString()
                .toLowerCase()
                .includes(search.toLowerCase()),
          ) ||
          getScrtAddress(token.dst_address).toLowerCase() ===
            search.toLowerCase()
        );
      }

      return true;
    })
    .map(token => {
      try {
        token.symbol = token.display_props.symbol;
      } catch (error) {
        if (token.src_coin === 'Ethereum') {
          token.symbol = 'ETH';
        } else {
          token.symbol = '--';
        }
      }
      return token;
    })
    .sort((t1, t2) =>
      Number(t1.totalLockedUSD) > Number(t2.totalLockedUSD) ? -1 : 1,
    )
    .map(token => {
      try {
        token.totalLocked = `${formatWithTwoDecimals(
          token.totalLockedNormal,
        )} ($${formatWithTwoDecimals(token.totalLockedUSD)})`;
      } catch (error) {}

      return token;
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
          {lastUpdateAgo ? (
            <Text>{`Last update: ${lastUpdateAgo}sec ago`}</Text>
          ) : (
            <Text> </Text>
          ) // this makes sure the TVL is sort of in the middle of the page
          }
        </Box>

        <Box
          className={styles.search}
          pad={{ horizontal: '9px' }}
          margin={{ top: 'medium', bottom: 'medium' }}
          style={{ width: '85vw' }}
        >
          <SearchInput value={search} onChange={setSearch} />
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

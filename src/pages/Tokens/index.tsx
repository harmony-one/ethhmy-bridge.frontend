import * as React from 'react';
import { useEffect, useState } from 'react';
import { Box } from 'grommet';
import { BaseContainer, PageContainer } from 'components';
import { observer } from 'mobx-react-lite';
import { useStores } from 'stores';
import { IColumn, Table } from 'components/Table';
import { ITokenInfo } from 'stores/interfaces';
import { formatWithTwoDecimals, truncateAddressString } from 'utils';
import * as styles from './styles.styl';
import { Text } from 'components/Base';
import { SearchInput } from 'components/Search';
import { getScrtAddress } from '../../blockchain-bridge';
import { isMobile } from 'react-device-detect';

const ethAddress = (value, num = 10) => (
  <Box direction="row" justify="start" align="center" style={{ marginTop: 4 }}>
    <img className={styles.imgToken} style={{ height: 20 }} src="/static/eth.svg" alt={'scrt'} />
    <a
      className={styles.addressLink}
      href={`${process.env.ETH_EXPLORER_URL}/token/${value}`}
      target="_blank"
      rel={'noreferrer'}
    >
      {truncateAddressString(value, num)}
    </a>
  </Box>
);

const secretContractAddress = (value, num = 10) => (
  <Box direction="row" justify="start" align="center" style={{ marginTop: 4 }}>
    <img className={styles.imgToken} style={{ height: 18 }} src="/static/scrt.svg" alt={'scrt'} />
    <a
      className={styles.addressLink}
      href={`${process.env.SCRT_EXPLORER_URL}/contracts/${value}`}
      target="_blank"
      rel={'noreferrer'}
    >
      {truncateAddressString(value, num)}
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
    width: 220,
    render: value => (value === 'native' ? 'native' : ethAddress(value, 8)),
  },
  {
    title: 'Secret Network Address',
    key: 'dst_address',
    dataIndex: 'dst_address',
    width: 220,
    render: value => secretContractAddress(getScrtAddress(value), 8),
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
    title: 'Minimum Withdraw',
    key: 'display_props',
    dataIndex: 'display_props',
    width: 120,
    className: styles.centerHeader,
    align: 'center',
    render: value => value.min_from_scrt,
  },
  {
    title: 'Total Locked',
    sortable: true,
    key: 'totalLocked',
    dataIndex: 'totalLocked',
    width: 200,
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
  const [search, setSearch] = useState<string>('');

  const [allColumns, setColumns] = useState<Array<any>>(getColumns());

  let columns = allColumns;
  if (isMobile) {
    columns = allColumns
      .filter(c => /Symbol|Locked|TVL/i.test(c.title))
      .map(c => {
        if (c.title === 'Total Locked') {
          c.title = 'TVL';
        }
        delete c.width;

        return c;
      });
  }

  useEffect(() => {
    tokens.init({ sorters: {}, sorter: 'none' });
    //tokens.fetch();
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
          ) || getScrtAddress(token.dst_address).toLowerCase() === search.toLowerCase()
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
      (token as any).key = token.symbol; // make react not sad
      return token;
    })
    .sort((t1, t2) => (Number(t1.totalLockedUSD) > Number(t2.totalLockedUSD) ? -1 : 1))
    .map(token => {
      try {
        token.totalLocked = `${formatWithTwoDecimals(token.totalLockedNormal)} ($${formatWithTwoDecimals(
          token.totalLockedUSD,
        )})`;
      } catch (error) {}

      return token;
    });

  return (
    <BaseContainer>
      <PageContainer>
        <Box direction="row" justify="between" align="center" margin={{ top: 'medium' }} pad={{ horizontal: 'medium' }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '100%',
            }}
          >
            <span style={{ fontSize: '1.5em', fontWeight: 'bolder' }}>
              {isMobile ? 'TVL' : 'Total Value Locked'} (USD)
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
            </span>
          </div>
          {lastUpdateAgo ? <Text>{`Last update: ${lastUpdateAgo}sec ago`}</Text> : <Text> </Text> // this makes sure the TVL is sort of in the middle of the page
          }
        </Box>

        {!isMobile && (
          <Box
            className={styles.search}
            pad={{ horizontal: '9px' }}
            margin={{ top: 'medium', bottom: 'medium' }}
            style={{ width: '85vw' }}
          >
            <SearchInput value={search} onChange={setSearch} />
          </Box>
        )}

        <Box direction="row" wrap={true} fill={true} justify="center" align="start">
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

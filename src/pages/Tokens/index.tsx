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

const scrtAddress = value => (
  <Box direction="row" justify="start" align="center" style={{ marginTop: 4 }}>
    <img className={styles.imgToken} style={{ height: 18 }} src="/scrt.svg" />
    <a
      className={styles.addressLink}
      href={`${process.env.SCRT_EXPLORER_URL}/address/${value}`}
      target="_blank"
    >
      {truncateAddressString(value, 10)}
    </a>
  </Box>
);

// todo: handle multiple networks
const getColumns = ({ hmyLINKBalanceManager }): IColumn<ITokenInfo>[] => [
  {
    title: 'Symbol',
    key: 'symbol',
    dataIndex: 'symbol',
    width: 140,
    className: styles.leftHeader,
    render: value => (
      <Box direction="column" justify="center" pad={{ left: 'medium' }}>
        {value ? value.toUpperCase() : '--'}
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
    key: 'src_address',
    dataIndex: 'src_address',
    width: 280,
    render: value => ethAddress(value),
  },
  {
    title: 'Secret Network Address',
    key: 'dst_address',
    dataIndex: 'dst_address',
    width: 300,
    render: value => scrtAddress(getScrtAddress(value)),
  },
  // {
  //   title: 'Decimals',
  //   key: 'decimals',
  //   dataIndex: 'decimals',
  //   width: 100,
  //   className: styles.centerHeader,
  //   align: 'center',
  // },
  // {
  //   title: 'Total Locked',
  //   // sortable: true,
  //   key: 'totalLockedNormal',
  //   dataIndex: 'totalLockedNormal',
  //   width: 140,
  //   render: value => (
  //     <Box direction="column" justify="center">
  //       {formatWithTwoDecimals(value)}
  //     </Box>
  //   ),
  //   // className: styles.centerHeader,
  //   // align: 'center',
  // },
  // {
  //   title: 'Total Locked USD',
  //   sortable: true,
  //   key: 'totalLockedUSD',
  //   defaultSort: 'asc',
  //   dataIndex: 'totalLockedUSD',
  //   width: 210,
  //   className: styles.rightHeaderSort,
  //   align: 'right',
  //   render: value => (
  //     <Box direction="column" justify="center" pad={{ right: 'medium' }}>
  //       {formatWithTwoDecimals(value)}
  //     </Box>
  //   ),
  // },
];

export const Tokens = observer((props: any) => {
  const { tokens, user } = useStores();
  const [search, setSearch] = useState('');

  const [columns, setColumns] = useState(getColumns(user));

  useEffect(() => {
    tokens.init({sorters: {}, sorter: 'none'});
    tokens.fetch();
  }, []);
  /*
  useEffect(() => {
    setColumns(getColumns(user));
  }, [user.hmyLINKBalanceManager]);
 */
  const onChangeDataFlow = (props: any) => {
    tokens.onChangeDataFlow(props);
  };

  const lastUpdateAgo = Math.ceil((Date.now() - tokens.lastUpdateTime) / 1000);

  const filteredData = tokens.data.filter(token => {
    if (search) {
      // todo: check dst_network
      return (
        Object.values(token).some(value =>
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
              {/*/!*<span*/}
              {/*  style={{*/}
              {/*    marginLeft: 5,*/}
              {/*    color: '#47b8eb',*/}
              {/*    fontWeight: 600,*/}
              {/*    letterSpacing: 0.2,*/}
              {/*  }}*/}
              {/*>*/}
              {/*  {formatWithTwoDecimals(tokens.totalLockedUSD)}*/}
              {/*</span>*!/*/}
            </Title>
          </Box>

          <Text>{`Last update: ${lastUpdateAgo}sec ago`}</Text>
        </Box>

        <Box
          pad={{ horizontal: '9px' }}
          margin={{ top: 'medium', bottom: 'medium' }}
          // style={{ maxWidth: 500 }}
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

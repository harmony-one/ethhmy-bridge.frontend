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
import { getBech32Address } from '../../blockchain-bridge';

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
    key: 'erc20Address',
    dataIndex: 'erc20Address',
    width: 280,
    render: value => ethAddress(value),
  },
  {
    title: 'HRC20 Address',
    key: 'hrc20Address',
    dataIndex: 'hrc20Address',
    width: 280,
    render: value => oneAddress(getBech32Address(value)),
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
    key: 'totalLocked',
    dataIndex: 'totalLocked',
    width: 200,
    className: styles.rightHeader,
    align: 'right',
    render: (value, data) => (
      <Box direction="column" justify="center" pad={{ right: 'medium' }}>
        {formatWithTwoDecimals(
          data.symbol === 'LINK'
            ? hmyLINKBalanceManager
            : divDecimals(value, data.decimals),
        )}
      </Box>
    ),
  },
];

export const Tokens = observer((props: any) => {
  const { tokens, user } = useStores();
  const [search, setSearch] = useState('');

  const [columns, setColumns] = useState(getColumns(user));

  useEffect(() => {
    tokens.init();
  }, []);

  useEffect(() => {
    setColumns(getColumns(user));
  }, [user.hmyLINKBalanceManager]);

  const onChangeDataFlow = (props: any) => {
    tokens.onChangeDataFlow(props);
  };

  const lastUpdateAgo = Math.ceil((Date.now() - tokens.lastUpdateTime) / 1000);

  const filteredData = tokens.data.filter(token => {
    if (search) {
      return (
        Object.values(token).some(value =>
          value
            .toString()
            .toLowerCase()
            .includes(search.toLowerCase()),
        ) ||
        getBech32Address(token.hrc20Address).toLowerCase() ===
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

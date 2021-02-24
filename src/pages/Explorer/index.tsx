import * as React from 'react';
import { useEffect, useState } from 'react';
import { Box } from 'grommet';
import { BaseContainer, PageContainer } from 'components';
import { observer } from 'mobx-react-lite';
import { useStores } from 'stores';
import { IColumn, Table } from 'components/Table';
import { ISwap, TOKEN } from 'stores/interfaces';
import { dateTimeFormat, truncateAddressString } from 'utils';
import * as styles from './styles.styl';
import cn from 'classnames';
import { ERC20Token, FormatWithDecimals, SecretToken } from './Components';
import { SwapStatus } from '../../constants';
import { getScrtAddress } from '../../blockchain-bridge';
import { SearchInput } from '../../components/Search';

const ethAddress = value => (
  <Box direction="row" justify="start" align="center" style={{ marginTop: 4 }}>
    <img className={styles.imgToken} style={{ height: 20 }} src="/static/eth.svg" />
    <a className={styles.addressLink} href={`${process.env.ETH_EXPLORER_URL}/address/${value}`} target="_blank">
      {truncateAddressString(value, 5)}
    </a>
  </Box>
);

const secretAddress = value => (
  <Box direction="row" justify="start" align="center" style={{ marginTop: 4 }}>
    <img className={styles.imgToken} style={{ height: 18 }} src="/static/scrt.svg" />
    <a className={styles.addressLink} href={`${process.env.SCRT_EXPLORER_URL}/accounts/${value}`} target="_blank">
      {truncateAddressString(value, 5)}
    </a>
  </Box>
);

const swapToText = (status: SwapStatus): string => {
  switch (status) {
    case SwapStatus.SWAP_FAILED:
      return 'failed';

    case SwapStatus.SWAP_CONFIRMED:
      return 'success';

    default:
      return 'sending...';
  }
};

const getColumns = ({ user }): IColumn<ISwap>[] => [
  {
    title: 'Recipient',
    key: 'dst_address',
    dataIndex: 'dst_address',
    width: 200,
    render: (value, data) => (data.src_network === 'Ethereum' ? secretAddress(value) : ethAddress(value)),
  },
  {
    title: 'Status',
    key: 'status',
    dataIndex: 'status',
    width: 140,
    render: value => {
      let status = swapToText(SwapStatus[SwapStatus[value]]);
      return <Box className={cn(styles.status, styles[status])}>{status}</Box>;
    },
  },
  {
    title: 'From',
    key: 'src_coin',
    dataIndex: 'src_coin',
    width: 180,
    render: (value, data) => {
      return data.src_network === 'Ethereum' ? (
        <ERC20Token value={TOKEN.ERC20} erc20Address={data.src_coin} />
      ) : (
        <SecretToken value={TOKEN.S20} secretAddress={data.src_coin} />
      );
    },
  },
  {
    title: 'To',
    key: 'dst_coin',
    dataIndex: 'dst_coin',
    width: 180,
    render: (value, data) => {
      return data.dst_network === 'Ethereum' ? (
        <ERC20Token value={TOKEN.ERC20} erc20Address={data.dst_coin} />
      ) : (
        <SecretToken value={TOKEN.S20} secretAddress={data.dst_coin} />
      );
    },
  },
  {
    title: 'Amount',
    key: 'amount',
    dataIndex: 'amount',
    width: 120,
    render: (value, data) =>
      data.src_network === 'Ethereum' ? (
        <FormatWithDecimals type={TOKEN.ERC20} amount={value} address={data.src_coin} />
      ) : (
        <FormatWithDecimals type={TOKEN.ERC20} amount={value} address={data.dst_coin} />
      ),
  },
  {
    title: 'Time',
    key: 'created_on',
    dataIndex: 'created_on',
    width: 180,
    render: value => dateTimeFormat(value),
  },
];

export const Explorer = observer((props: any) => {
  const { operations, user, tokens } = useStores();

  const [columns, setColumns] = useState(getColumns({ user }));
  const [search, setSearch] = useState('');

  useEffect(() => {
    tokens.init();
    tokens.fetch();
    operations.init({
      isLocal: true,
      sorter: 'created_on, desc',
      pollingInterval: 20000,
    });
    operations.fetch();
  }, []);

  useEffect(() => {
    setColumns(getColumns({ user }));
  }, [user.scrtRate, user.ethRate, tokens.data, tokens.fetchStatus]);

  const onChangeDataFlow = (props: any) => {
    operations.onChangeDataFlow(props);
  };

  // todo: make this a button.. it's too slow as a live search
  const filteredData = operations.allData
    .filter(value => {
      if (search) {
        return (
          Object.values(value).some(
            value =>
              value &&
              value
                .toString()
                .toLowerCase()
                .includes(search.toLowerCase()),
          ) || getScrtAddress(value.dst_address).toLowerCase() === search.toLowerCase()
        );
      }

      return true;
    })
    .sort((op1, op2) => (op1.created_on > op2.created_on ? -1 : 1));

  return (
    <BaseContainer>
      <PageContainer>
        <Box direction="row" wrap={true} fill={true} justify="center" align="start" margin={{ top: 'xlarge' }}>
          <Box
            className={styles.search}
            justify="end"
            style={{ width: '85vw' }}
            pad={{ horizontal: '9px' }}
            margin={{ top: 'medium', bottom: 'medium' }}
          >
            <SearchInput value={search} onChange={setSearch} />
          </Box>

          <Table
            data={search ? filteredData : operations.data}
            columns={columns}
            isPending={operations.isPending}
            dataLayerConfig={operations.dataFlow}
            onChangeDataFlow={onChangeDataFlow}
            onRowClicked={() => {}}
            tableParams={{
              rowKey: (data: any) => data.id,
            }}
          />
        </Box>
      </PageContainer>
    </BaseContainer>
  );
});

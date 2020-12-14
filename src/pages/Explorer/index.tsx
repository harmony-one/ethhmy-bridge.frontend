import * as React from 'react';
import { useEffect, useState } from 'react';
import { Box } from 'grommet';
import { BaseContainer, PageContainer } from 'components';
import { observer } from 'mobx-react-lite';
import { useStores } from 'stores';
import { IColumn, Table } from 'components/Table';
import { ISwap, ITokenInfo, TOKEN } from 'stores/interfaces';
import { dateTimeFormat, truncateAddressString } from 'utils';
import * as styles from './styles.styl';
import cn from 'classnames';
import { ERC20Token, FormatWithDecimals, SecretToken } from './Components';
import { Checkbox } from 'components/Base/components/Inputs';
import { SwapStatus } from '../../constants';
import { getScrtAddress } from '../../blockchain-bridge/scrt';
import { SearchInput } from '../../components/Search';

const ethAddress = value => (
  <Box direction="row" justify="start" align="center" style={{ marginTop: 4 }}>
    <img className={styles.imgToken} style={{ height: 20 }} src="/eth.svg" />
    <a
      className={styles.addressLink}
      href={`${process.env.ETH_EXPLORER_URL}/address/${value}`}
      target="_blank"
    >
      {truncateAddressString(value, 5)}
    </a>
  </Box>
);

const secretAddress = value => (
  <Box direction="row" justify="start" align="center" style={{ marginTop: 4 }}>
    <img className={styles.imgToken} style={{ height: 18 }} src="/scrt.svg" />
    <a
      className={styles.addressLink}
      href={`${process.env.SCRT_EXPLORER_URL}/accounts/${value}`}
      target="_blank"
    >
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
  // {
  //   title: 'Type',
  //   key: 'type',
  //   dataIndex: 'type',
  //   width: 180,
  //   render: value => <OperationType type={value} />,
  // },

  // {
  //   title: 'From',
  //   key: 'src_address',
  //   dataIndex: 'src_address',
  //   width: 280,
  //   render: (value, data) =>
  //     data.src_network === "Ethereum"
  //       ? ethAddress(value)
  //       : oneAddress(value),
  // },
  {
    title: 'Recipient',
    key: 'dst_address',
    dataIndex: 'dst_address',
    width: 200,
    render: (value, data) =>
      data.src_network === 'Ethereum'
        ? secretAddress(value)
        : ethAddress(value),
  },
  // {
  //   title: 'To',
  //   key: 'dst_address',
  //   dataIndex: 'dst_address',
  //   width: 200,
  //   render: (value, data) =>
  //     data.type === EXCHANGE_MODE.ETH_TO_SCRT
  //       ? oneAddress(data.oneAddress)
  //       : ethAddress(data.ethAddress),
  // },

  // {
  //   title: 'Eth address',
  //   key: 'ethAddress',
  //   dataIndex: 'ethAddress',
  //   width: 160,
  //   render: value => (
  //     <a
  //       className={styles.addressLink}
  //       href={`${process.env.ETH_EXPLORER_URL}/address/${value}`}
  //       target="_blank"
  //     >
  //       {truncateAddressString(value, 5)}
  //     </a>
  //   ),
  // },
  // {
  //   title: 'One address',
  //   key: 'oneAddress',
  //   dataIndex: 'oneAddress',
  //   width: 160,
  //   render: value => (
  //     <a
  //       className={styles.addressLink}
  //       href={`${process.env.SCRT_EXPLORER_URL}/accounts/${value}`}
  //       target="_blank"
  //     >
  //       {truncateAddressString(value, 5)}
  //     </a>
  //   ),
  // },
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
    width: 200,
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
    width: 200,
    render: (value, data) => {
      if (data.dst_network === 'Ethereum') {
        return <ERC20Token value={TOKEN.ERC20} erc20Address={data.dst_coin} />;
      } else {
        const token: ITokenInfo = user.stores.tokens.allData.find(
          t => t.dst_coin === data.dst_coin,
        );
        if (token && token.display_props) {
          return <Box>secret{token.display_props.symbol}</Box>;
        } else {
          return <Box>secretETH</Box>;
        }
      }
    },
  },
  {
    title: 'Amount',
    key: 'amount',
    dataIndex: 'amount',
    width: 120,
    render: (value, data) =>
      data.src_network === 'Ethereum' ? (
        <FormatWithDecimals
          type={TOKEN.ERC20}
          amount={value}
          address={data.src_coin}
        />
      ) : (
        <FormatWithDecimals
          type={TOKEN.ERC20}
          amount={value}
          address={data.dst_coin}
        />
      ),
  },
  {
    title: 'Time',
    key: 'created_on',
    dataIndex: 'created_on',
    width: 120,
    render: value => dateTimeFormat(value),
  },
  // {
  //   title: 'Txn fee',
  //   key: 'fee',
  //   dataIndex: 'fee',
  //   className: styles.rightHeader,
  //   width: 180,
  //   render: (value, data) => {
  //     const fee = getOperationFee(data);
  //     const isETH = data.type === EXCHANGE_MODE.ETH_TO_SCRT;
  //
  //     return <Price value={fee} isEth={isETH} />;
  //   },
  // },
];

export const Explorer = observer((props: any) => {
  const { operations, user, tokens, userMetamask } = useStores();

  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
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

  const setMyOperationsHandler = value => {
    let ethAddress, oneAddress;

    if (value) {
      ethAddress = userMetamask.ethAddress || undefined;
      oneAddress = user.address || undefined;
    }

    operations.onChangeDataFlow({
      filters: { ['ethAddress']: ethAddress, ['oneAddress']: oneAddress },
    });
  };

  const hasFilters =
    operations.filters['ethAddress'] && operations.filters['oneAddress'];

  const isAuthorized = userMetamask.ethAddress || user.address;

  // todo: make this a button.. it's too slow as a live search
  const filteredData = operations.allData.filter(value => {
    if (search) {
      return (
        Object.values(value).some(
          value =>
            value &&
            value
              .toString()
              .toLowerCase()
              .includes(search.toLowerCase()),
        ) ||
        getScrtAddress(value.dst_address).toLowerCase() === search.toLowerCase()
      );
    }

    return true;
  });

  return (
    <BaseContainer>
      <PageContainer>
        <Box
          direction="row"
          wrap={true}
          fill={true}
          justify="center"
          align="start"
          margin={{ top: 'xlarge' }}
        >
          {/*    {isAuthorized ? (
            <Box
              direction="row"
              pad={{ horizontal: 'large' }}
              justify="end"
              fill={true}
              margin={{ bottom: '14px' }}
            >
              <Checkbox
                label="Only my transactions"
                value={hasFilters}
                onChange={setMyOperationsHandler}
              />
            </Box>
          ) : null} */}
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
              // expandable: {
              //   expandedRowKeys,
              //   onExpandedRowsChange: setExpandedRowKeys,
              //   expandedRowRender: (data: any) => <ExpandedRow data={data} />,
              //   expandRowByClick: true,
              // },
            }}
          />
        </Box>
      </PageContainer>
    </BaseContainer>
  );
});

import * as React from 'react';
import { useEffect, useState } from 'react';
import { Box } from 'grommet';
import { BaseContainer, PageContainer } from 'components';
import { observer } from 'mobx-react-lite';
import { useStores } from 'stores';
import { IColumn, Table } from 'components/Table';
import { EXCHANGE_MODE, IOperation, TOKEN } from 'stores/interfaces';
import {
  dateTimeAgoFormat,
  formatWithSixDecimals,
  truncateAddressString,
} from 'utils';
import * as styles from './styles.styl';
import cn from 'classnames';
import { ExpandedRow, getOperationFee } from './ExpandedRow';
import { ERC20Token, Price } from './Components';
import { Checkbox } from 'components/Base/components/Inputs';
import { NETWORK_ICON } from '../../stores/names';
import { getChecksumAddress } from '../../blockchain-bridge';

const EthAddress = observer<any>(
  (params: { address; operation: IOperation }) => {
    const { exchange } = useStores();
    const icon = NETWORK_ICON[params.operation.network];

    return (
      <Box
        direction="row"
        justify="start"
        align="center"
        style={{ marginTop: 4 }}
      >
        <img className={styles.imgToken} style={{ height: 20 }} src={icon} />
        <a
          className={styles.addressLink}
          href={`${exchange.getExplorerByNetwork(
            params.operation.network,
          )}/address/${getChecksumAddress(params.address)}`}
          target="_blank"
        >
          {truncateAddressString(getChecksumAddress(params.address), 5)}
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
      href={`${process.env.HMY_EXPLORER_URL}/address/${value}`}
      target="_blank"
    >
      {truncateAddressString(value, 5)}
    </a>
  </Box>
);

const getColumns = ({ user }): IColumn<IOperation>[] => [
  // {
  //   title: 'Type',
  //   key: 'type',
  //   dataIndex: 'type',
  //   width: 180,
  //   render: value => <OperationType type={value} />,
  // },

  {
    title: 'From',
    key: 'ethAddress',
    dataIndex: 'ethAddress',
    width: 200,
    render: (value, data) =>
      data.type === EXCHANGE_MODE.ETH_TO_ONE ? (
        <EthAddress address={value} operation={data} />
      ) : (
        oneAddress(data.oneAddress)
      ),
  },

  {
    title: 'To',
    key: 'oneAddress',
    dataIndex: 'oneAddress',
    width: 200,
    render: (value, data) =>
      data.type === EXCHANGE_MODE.ETH_TO_ONE ? (
        oneAddress(data.oneAddress)
      ) : (
        <EthAddress address={value} operation={data} />
      ),
  },

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
  //       href={`${process.env.HMY_EXPLORER_URL}/address/${value}`}
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
    render: value => (
      <Box className={cn(styles.status, styles[value])}>{value}</Box>
    ),
  },
  {
    title: 'Asset',
    key: 'token',
    dataIndex: 'token',
    width: 100,
    render: (value, data) => (
      <ERC20Token
        value={value}
        erc20Address={data.erc20Address}
        hrc20Address={data.hrc20Address}
      />
    ),
  },
  {
    title: 'Amount',
    key: 'amount',
    dataIndex: 'amount',
    width: 120,
    render: (value, data) =>
      data.token === TOKEN.ERC721 ? value.length : formatWithSixDecimals(value),
  },
  {
    title: 'Age',
    key: 'timestamp',
    dataIndex: 'timestamp',
    width: 160,
    render: value => (value ? dateTimeAgoFormat(value * 1000) : '--'),
  },
  {
    title: 'Txn fee',
    key: 'fee',
    dataIndex: 'fee',
    className: styles.rightHeader,
    width: 180,
    render: (value, data) => {
      const fee = getOperationFee(data);
      const isETH = data.type === EXCHANGE_MODE.ETH_TO_ONE;

      return <Price value={fee} isEth={isETH} />;
    },
  },
];

export const Explorer = observer((props: any) => {
  const { operations, user, tokens, userMetamask } = useStores();

  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [columns, setColumns] = useState(getColumns({ user }));

  useEffect(() => {
    tokens.init();
    tokens.fetch();
    operations.init();
  }, []);

  useEffect(() => {
    setColumns(getColumns({ user }));
  }, [user.oneRate, user.ethRate, tokens.data, tokens.fetchStatus]);

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
          {isAuthorized ? (
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
          ) : null}
          <Table
            data={operations.data}
            columns={columns}
            isPending={operations.isPending}
            dataLayerConfig={operations.dataFlow}
            onChangeDataFlow={onChangeDataFlow}
            onRowClicked={() => {}}
            tableParams={{
              rowKey: (data: any) => data.id,
              expandable: {
                expandedRowKeys,
                onExpandedRowsChange: setExpandedRowKeys,
                expandedRowRender: (data: any) => <ExpandedRow data={data} />,
                expandRowByClick: true,
              },
            }}
          />
        </Box>
      </PageContainer>
    </BaseContainer>
  );
});

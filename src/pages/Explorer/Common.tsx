import * as React from 'react';
import { EXCHANGE_MODE, IOperation, TOKEN } from 'stores/interfaces';
import {
  dateTimeAgoFormat,
  formatWithSixDecimals,
  truncateAddressString,
} from 'utils';
import * as styles from './styles.styl';
import cn from 'classnames';
import { getOperationFee } from './ExpandedRow';
import { ERC20Token, Price } from './Components';
import { NETWORK_ICON } from '../../stores/names';
import { getChecksumAddress } from '../../blockchain-bridge';
import { observer } from 'mobx-react-lite';
import { useStores } from '../../stores';
import { Box } from 'grommet';
import { IColumn } from '../../components/Table';
import { ManageButton } from './ManageButton';
import { useEffect } from 'react';

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

export const getColumns = (
  { user },
  manager: string = '',
): IColumn<IOperation & { manager: boolean }>[] => {
  const columns: IColumn<IOperation & { manager: boolean }>[] = [
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
          network={data.network}
        />
      ),
    },
    {
      title: 'Amount',
      key: 'amount',
      dataIndex: 'amount',
      width: 120,
      render: (value, data) =>
        data.token === TOKEN.ERC721
          ? value.length
          : formatWithSixDecimals(value),
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

        return <Price value={fee} isEth={isETH} network={data.network} />;
      },
    },
  ];

  if (manager) {
    columns.push({
      title: 'Actions',
      key: 'manager',
      dataIndex: 'manager',
      className: styles.rightHeader,
      width: 180,
      render: (value, data) => {
        return <ManageButton operation={data} />;
      },
    });
  }

  return columns;
};

export const StatusField = (props: {
  text: string;
  error?: boolean;
  statusText: string;
}) => {
  return (
    <Box direction="row" gap="4px">
      {props.text}:{' '}
      <span
        style={{
          fontWeight: 'bold',
          color: !props.error ? 'rgb(0, 201, 167)' : 'red',
        }}
      >
        {props.statusText}
      </span>
    </Box>
  );
};

export const StatisticBlock = observer(() => {
  const { operations } = useStores();

  return (
    <Box direction="row" gap="30px">
      <StatusField text="Validator status" statusText="OK" />
      <StatusField text="Stuck operations" statusText="NO" />
      <StatusField text="Need to restart" statusText="NO" />
    </Box>
  );
});

export const StatisticBlockLight = observer(() => {
  const { operations } = useStores();

  return (
    <Box direction="row" gap="30px">
      <StatusField
        text="status"
        error={operations.fetchStatus === 'error'}
        statusText={operations.fetchStatus === 'error' ? 'OFFLINE' : 'ONLINE'}
      />
    </Box>
  );
});

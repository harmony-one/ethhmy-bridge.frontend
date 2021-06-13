import React from 'react';
import { useQuery } from '@apollo/client';
import { formatUnits, parseEther, parseUnits } from '@ethersproject/units';
import { TOKEN_EVENTS } from 'analytics/queries';
import { Table } from 'components/Table';
import { Box } from 'grommet';
import * as styles from '../Tokens/styles.styl';
import { BigNumber } from '@ethersproject/bignumber';
import { formatWithTwoDecimals } from 'utils';
import { OneAddress, OneTx, BridgedAddress } from 'components/ExplorerLinks';

const ONE = parseUnits('1');

const intervals = [
  { label: 'year', seconds: 31536000 },
  { label: 'month', seconds: 2592000 },
  { label: 'day', seconds: 86400 },
  { label: 'hour', seconds: 3600 },
  { label: 'minute', seconds: 60 },
  { label: 'second', seconds: 1 },
];

function timeSince(date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  const interval = intervals.find(i => i.seconds < seconds);
  const count = Math.floor(seconds / interval.seconds);
  return `${count} ${interval.label}${count !== 1 ? 's' : ''} ago`;
}

const getEventColumns = asset => [
  {
    title: 'Event',
    key: 'event',
    dataIndex: 'type',
    width: 160,
    className: styles.leftHeader,
    render: (value, data) => {
      return (
        <Box direction="column" justify="start">
          <OneTx tx={data.txHash}>{value}</OneTx>
        </Box>
      );
    },
  },
  {
    title: 'Value',
    key: 'amount',
    dataIndex: 'amount',
    width: 160,
    className: styles.rightHeaderSort,
    render: amount => {
      const value = asset?.price
        ? BigNumber.from(amount)
            .mul(parseEther(String(asset.price)))
            .div(ONE)
        : 0;
      return (
        <Box direction="column" align="end" pad={{ right: '10px' }}>
          $
          {value
            ? formatWithTwoDecimals(formatUnits(value, asset.decimals))
            : 0}
        </Box>
      );
    },
  },
  {
    title: 'Amount',
    key: 'amount',
    dataIndex: 'amount',
    width: 160,
    align: 'right',
    className: styles.rightHeaderSort,
    render: value => (
      <Box direction="column" align="end" pad={{ right: '10px' }}>
        {value ? formatWithTwoDecimals(formatUnits(value, asset.decimals)) : 0}
      </Box>
    ),
  },
  {
    title: 'Recipient',
    key: 'recipient',
    dataIndex: 'recipient',
    width: 420,
    render: (value, data) => {
      if (data.type === 'MINT') {
        return <OneAddress address={value} />;
      }
      if (data.type === 'BURN') {
        return <BridgedAddress address={value} network={asset.mappedNetwork} />;
      }
      return null;
    },
  },
  {
    title: 'Age',
    key: 'timestamp',
    dataIndex: 'timestamp',
    width: 180,
    className: styles.rightHeader,
    align: 'right',
    render: (value, data) => {
      return (
        <Box direction="column" align="end" pad={{ right: 'medium' }}>
          {timeSince(new Date(value * 1000))}
        </Box>
      );
    },
  },
];

export function RecentEvents({ asset }) {
  const { loading, error, data } = useQuery(TOKEN_EVENTS, {
    skip: !asset,
    variables: asset && {
      id: asset.id,
      first: 25,
      skip: 0,
    },
  });

  return (
    <Box direction="row" wrap={true} fill={true} justify="center" align="start">
      <Table
        data={data && data.events}
        columns={getEventColumns(asset)}
        isPending={!data && loading}
        dataLayerConfig={{}}
        hidePagination={true}
        onChangeDataFlow={() => null}
        onRowClicked={row => {}}
      />
    </Box>
  );
}

import React from 'react';
import { Table } from 'components/Table';
import { Box } from 'grommet';
import * as styles from './styles.styl';
import { formatWithSixDecimals, formatWithTwoDecimals } from 'utils';
import { formatEther, formatUnits } from '@ethersproject/units';
import { Text } from 'components/Base';
import { BridgedToken, OneToken } from 'components/ExplorerLinks';

const columns = [
  {
    title: 'Name',
    key: 'name',
    dataIndex: 'name',
    className: styles.leftHeader,
    render: (value, data) => (
      <Box direction="column" justify="start" pad={{ left: 'medium' }}>
        <div></div>
        <Text size="medium">
          {value} {data.symbol && <>({data.symbol.toUpperCase()})</>}
        </Text>
        <OneToken address={data.id} />
        {data.mappedAddress && (
          <BridgedToken network={data.network} address={data.mappedAddress} />
        )}
      </Box>
    ),
  },
  {
    title: 'Price',
    key: 'price',
    dataIndex: 'price',
    width: 140,
    className: styles.rightHeaderSort,
    render: (value, data) => (
      <Box direction="column" align="end" pad={{ right: '10px' }}>
        ${value ? formatWithTwoDecimals(formatEther(value)) : 0}
      </Box>
    ),
  },
  {
    title: 'Volume 24H',
    key: 'volume',
    dataIndex: 'volume',
    sortable: true,
    defaultSort: 'asc',
    width: 180,
    className: styles.rightHeader,
    render: (value, data) => {
      return (
        <Box direction="column" align="end" pad={{ right: '10px' }}>
          $
          {value ? formatWithTwoDecimals(formatUnits(value, data.decimals)) : 0}
        </Box>
      );
    },
  },
  {
    title: 'Total Locked',
    key: 'totalLocked',
    dataIndex: 'totalLocked',
    sortable: true,
    defaultSort: 'asc',
    width: 180,
    className: styles.rightHeader,
    render: (value, data) => (
      <Box direction="column" align="end" pad={{ right: '10px' }}>
        {value ? formatWithTwoDecimals(formatUnits(value, data.decimals)) : 0}
      </Box>
    ),
  },

  {
    title: 'TVL',
    sortable: true,
    key: 'tvl',
    defaultSort: 'asc',
    dataIndex: 'tvl',
    width: 210,
    className: styles.rightHeaderSort,
    align: 'right',
    render: (value, data) => {
      return (
        <Box direction="column" align="end" pad={{ right: 'medium' }}>
          ${value ? formatWithTwoDecimals(formatEther(value)) : 0}
        </Box>
      );
    },
  },
];

export function TokensTable({
  assets,
  isPending,
  dataFlow,
  onChangeDataFlow,
  onRowClicked,
}) {
  return (
    <Table
      data={assets}
      columns={columns}
      isPending={isPending && assets}
      hidePagination={true}
      dataLayerConfig={dataFlow}
      onChangeDataFlow={onChangeDataFlow}
      onRowClicked={onRowClicked}
    />
  );
}

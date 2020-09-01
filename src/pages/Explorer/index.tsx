import * as React from 'react';
import { Box } from 'grommet';
import { BaseContainer, PageContainer } from 'components';
import { observer } from 'mobx-react-lite';
import { useStores } from 'stores';
import { useEffect, useState } from 'react';
import { IColumn, Table } from 'components/Table';
import { IOperation } from 'stores/interfaces';
import {
  dateTimeAgoFormat,
  formatWithSixDecimals,
  formatWithTwoDecimals,
  truncateAddressString,
} from 'utils';
import * as styles from './styles.styl';
import cn from 'classnames';
import { ExpandedRow } from './ExpandedRow';
import { OperationType } from './Components';

const columns: IColumn<IOperation>[] = [
  {
    title: 'Type',
    key: 'type',
    dataIndex: 'type',
    width: 180,
    render: value => <OperationType type={value} />,
  },
  {
    title: 'Eth address',
    key: 'ethAddress',
    dataIndex: 'ethAddress',
    width: 160,
    render: value => (
      <a
        className={styles.addressLink}
        href={`${process.env.ETH_EXPLORER_URL}/address/${value}`}
        target="_blank"
      >
        {truncateAddressString(value, 5)}
      </a>
    ),
  },
  {
    title: 'One address',
    key: 'oneAddress',
    dataIndex: 'oneAddress',
    width: 160,
    render: value => (
      <a
        className={styles.addressLink}
        href={`${process.env.HMY_EXPLORER_URL}/address/${value}`}
        target="_blank"
      >
        {truncateAddressString(value, 5)}
      </a>
    ),
  },
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
    render: value => value.toUpperCase(),
  },
  {
    title: 'Amount',
    key: 'amount',
    dataIndex: 'amount',
    width: 120,
    render: value => formatWithTwoDecimals(value),
  },
  {
    title: 'Age',
    key: 'timestamp',
    dataIndex: 'timestamp',
    width: 180,
    render: value => dateTimeAgoFormat(value * 1000),
  },
  {
    title: 'Txn fee',
    key: 'fee',
    dataIndex: 'fee',
    width: 100,
    render: value => formatWithSixDecimals(value || 0),
  },
];

export const Explorer = observer((props: any) => {
  const { operations } = useStores();

  const [expandedRowKeys, setExpandedRowKeys] = useState([]);

  useEffect(() => {
    operations.getList();
  }, []);

  return (
    <BaseContainer>
      <PageContainer>
        <Box
          direction="row"
          wrap={true}
          fill={true}
          justify="between"
          align="start"
        >
          <Table
            data={operations.list}
            columns={columns}
            hidePagination
            dataLayerConfig={{
              paginationData: {
                pageSize: operations.list.length,
                currentPage: 1,
                totalPages: 1,
              },
            }}
            onChangeDataFlow={() => {}}
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

import * as React from 'react';
import { useEffect, useState } from 'react';
import { Box } from 'grommet';
import { BaseContainer, PageContainer } from 'components';
import { observer } from 'mobx-react-lite';
import { useStores } from 'stores';
import { Table } from 'components/Table';
import { getColumns } from './Common';
import { ExpandedRow } from './ExpandedRow';
import { Checkbox } from '../../components/Base/components/Inputs/types';

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
              align="center"
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

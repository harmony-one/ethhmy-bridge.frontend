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
import { Title } from '../../components/Base/components/Title';
import {
  ACTION_TYPE,
  EXCHANGE_MODE,
  IOperation,
  STATUS,
} from '../../stores/interfaces';

export const isStuckOperation = (o: IOperation) => {
  if (o.status === STATUS.IN_PROGRESS || o.status === STATUS.WAITING) {
    const actionType =
      o.type === EXCHANGE_MODE.ETH_TO_ONE
        ? ACTION_TYPE.mintToken
        : ACTION_TYPE.unlockToken;

    const action = o.actions.find(a => a.type === actionType);

    if (
      action &&
      action.timestamp &&
      (Date.now() - action.timestamp * 1000) / (1000 * 60) > 21
    ) {
      return true;
    }
  }

  return false;
};

export const StuckOperations = observer((props: any) => {
  const { operations, user, tokens, userMetamask } = useStores();

  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [columns, setColumns] = useState(getColumns({ user }));

  useEffect(() => {
    tokens.init();
    tokens.fetch();
    operations.init({
      filters: { stuck: true },
    });
  }, [operations, tokens]);

  useEffect(() => {
    setColumns(getColumns({ user }));
  }, [user.oneRate, user.ethRate, tokens.data, tokens.fetchStatus, user]);

  const onChangeDataFlow = (props: any) => {
    operations.onChangeDataFlow({ ...props, filters: { stuck: true } });
  };

  const isAuthorized = userMetamask.ethAddress || user.address;

  const needsToBeRestarted = operations.data.some(isStuckOperation);

  return (
    <BaseContainer>
      <PageContainer>
        <Box
          direction="column"
          align="center"
          margin={{ top: 'xlarge' }}
          gap="20px"
        >
          <Title size="large">Stuck operations</Title>
          <Title>
            Bridge needs to be restarted ? -{' '}
            {needsToBeRestarted ? (
              <span style={{ color: 'red' }}>YES</span>
            ) : (
              'No'
            )}
          </Title>
        </Box>
        <Box
          direction="row"
          wrap={true}
          fill={true}
          justify="center"
          align="start"
          margin={{ top: 'medium' }}
        >
          {isAuthorized ? (
            <Box
              direction="row"
              pad={{ horizontal: 'large' }}
              justify="between"
              align="center"
              fill={true}
              margin={{ bottom: '14px' }}
            >
              <Box align="center" dir="row">
                <Checkbox
                  label="Stuck operations"
                  value={operations.filters['stuck']}
                  onChange={value =>
                    operations.onChangeDataFlow({
                      filters: { stuck: value ? value : undefined },
                    })
                  }
                />
              </Box>
              <Box></Box>
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
              rowClassName: (data: IOperation) =>
                isStuckOperation(data) ? 'stuckOperation' : '',
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

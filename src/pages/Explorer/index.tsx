import * as React from 'react';
import { useEffect, useState } from 'react';
import { Box } from 'grommet';
import { BaseContainer, PageContainer } from 'components';
import { observer } from 'mobx-react-lite';
import { useStores } from 'stores';
import { Table } from 'components/Table';
import { getColumns, StatisticBlockLight } from './Common';
import { ExpandedRow } from './ExpandedRow';
import { Checkbox } from '../../components/Base/components/Inputs/types';
import { validators } from '../../services';
import { Title } from '../../components/Base/components/Title';

export const Explorer = observer((props: any) => {
  const { operations, user, tokens, userMetamask } = useStores();
  const validator = props.match.params.validator || 0;

  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [columns, setColumns] = useState(getColumns({ user }));

  useEffect(() => {
    const validator = props.match.params.validator || 0;

    operations.validatorUrl = validators[validator] || validators[0];

    tokens.init();
    tokens.fetch();
    operations.init();
  }, []);

  useEffect(() => {
    setColumns(getColumns({ user }));
  }, [user.oneRate, user.ethRate, tokens.data, tokens.fetchStatus]);

  const onChangeDataFlow = (props: any) => {
    operations.validatorUrl = validators[validator] || validators[0];

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
          <Box
            direction="row"
            fill={true}
            justify="between"
            align="center"
            pad={{ horizontal: 'large' }}
            margin={{ bottom: '14px' }}
          >
            {!!validator ? (
              <Box
                direction="row"
                align="center"
                justify="start"
                gap="20px"
              >
                <Box direction="row" align="center">
                  <Title size="medium">
                    Validator:
                    <span style={{ color: '#47b8eb', margin: '0 0 0 10px' }}>
                      {operations.validatorUrl}
                    </span>
                  </Title>
                </Box>
                <StatisticBlockLight />
              </Box>
            ) : (
              <Box />
            )}
            {isAuthorized ? (
              <Box>
                <Checkbox
                  label="Only my transactions"
                  value={hasFilters}
                  onChange={setMyOperationsHandler}
                />
              </Box>
            ) : (
              <Box />
            )}
          </Box>
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

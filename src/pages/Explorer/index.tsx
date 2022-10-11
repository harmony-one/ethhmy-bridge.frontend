import * as React from 'react';
import { useEffect, useState } from 'react';
import { Box } from 'grommet';
import { observer } from 'mobx-react-lite';
import { useStores } from 'stores';
import { Table } from 'components/Table';
import { getColumns, StatisticBlockLight } from './Common';
import { ExpandedRow } from './ExpandedRow';
import { validators } from '../../services';
import { Title } from '../../components/Base/components/Title';
import { Text } from '../../components/Base';
import {
  CustomPagination,
  PaginationType,
} from '../../components/Table/CustomPagination';
import { LayoutCommon } from '../../components/Layouts/LayoutCommon/LayoutCommon';
import { ExpandIcon } from '../../components/Table/ExpandIcon/ExpandIcon';
import { CheckboxButton } from '../../components/Base/components/Inputs/types/CheckboxButton';

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
    <LayoutCommon>
      <Box direction="column" margin={{ top: 'xlarge' }}>
        <Box
          direction="row-responsive"
          pad={{ bottom: '48px' }}
          justify="between"
          align="end"
        >
          {!!validator && (
            <Box direction="row" align="center" justify="start" gap="20px">
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
          )}
          <Box>
            <Title size="small" color="NWhite">
              Latest Transactions
            </Title>
          </Box>
          <Box direction="row" gap="xsmall" align="center">
            {isAuthorized && (
              <Box direction="column">
                <Text
                  color="NGray4"
                  style={{ fontSize: '10px', marginBottom: '8px' }}
                >
                  SHOW ONLY
                </Text>
                <CheckboxButton
                  label="My transactions"
                  value={hasFilters}
                  onChange={setMyOperationsHandler}
                />
              </Box>
            )}
            <Box direction="column">
              <Text
                color="NGray4"
                style={{ fontSize: '10px', marginBottom: '8px' }}
              >
                DISPLAYING PER PAGE
              </Text>
              <CustomPagination
                showPages={false}
                type={
                  hasFilters ? PaginationType.PAGING : PaginationType.DEFAULT
                }
                config={operations.dataFlow.paginationData}
                onChange={config => {
                  onChangeDataFlow({ paginationData: config });
                }}
                activeColor="NGray3"
              />
            </Box>
          </Box>
        </Box>
        <Box>
          <Table
            paginationType={
              hasFilters ? PaginationType.PAGING : PaginationType.DEFAULT
            }
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
                expandIcon: ExpandIcon,
              },
            }}
          />
        </Box>
      </Box>
    </LayoutCommon>
  );
});

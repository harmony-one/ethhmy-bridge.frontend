import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { Box } from 'grommet';
import { BaseContainer, PageContainer } from 'components';
import { observer } from 'mobx-react-lite';
import { useStores } from 'stores';
import { Table } from 'components/Table';
import { Button, Text, TextInput } from 'components/Base';
import { getColumns, StatisticBlock } from './Common';
import { ExpandedRow } from './ExpandedRow';
import { Select } from '../../components/Base/components/Inputs/types';
import { Title } from '../../components/Base/components/Title';
import * as services from '../../services';
import {
  ACTION_TYPE,
  EXCHANGE_MODE,
  IOperation,
  NETWORK_TYPE,
  STATUS,
  TOKEN,
} from '../../stores/interfaces';
import { validators } from '../../services';
import { SearchInput } from '../../components/Search';

export const isStuckOperation = (o: IOperation) => {
  if (o.status === STATUS.IN_PROGRESS || o.status === STATUS.WAITING) {
    let actionType: ACTION_TYPE;

    switch (o.token) {
      case TOKEN.ONE:
        actionType =
          o.type === EXCHANGE_MODE.ETH_TO_ONE
            ? ACTION_TYPE.unlockHRC20Token
            : ACTION_TYPE.mintHRC20Token;
        break;

      default:
        actionType =
          o.type === EXCHANGE_MODE.ETH_TO_ONE
            ? ACTION_TYPE.mintToken
            : ACTION_TYPE.unlockToken;
        break;
    }

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

const reloadEvents = async (
  manager: string,
  value: number,
  network?: NETWORK_TYPE,
) => {
  await services.manage('reload_events', manager, {
    value,
    network,
  });

  alert(`Last ${value} Events will be reloaded in next 1-2 min`);
};

export const AdminExplorer = observer((props: any) => {
  const { adminOperations, user, tokens, actionModals } = useStores();

  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [columns, setColumns] = useState(getColumns({ user }));
  const [search, setSearch] = useState('');

  useEffect(() => {
    tokens.init();
    tokens.fetch();
    adminOperations.init();
  }, [adminOperations, tokens]);

  useEffect(() => {
    setColumns(getColumns({ user }, adminOperations.manager));
  }, [
    user.oneRate,
    user.ethRate,
    tokens.data,
    tokens.fetchStatus,
    user,
    adminOperations.manager,
  ]);

  const changeValidator = useCallback(() => {
    actionModals.open(
      () => {
        const [value, onChange] = useState('');

        return (
          <Box pad="large" gap="30px">
            <Title>Choose your validator</Title>
            <Box direction="column" style={{ width: '100%' }} gap="5px">
              <Text>Validator Url:</Text>
              <Select
                size="full"
                value={adminOperations.validatorUrl}
                options={validators.map(v => ({ text: v, value: v }))}
                onChange={value => {
                  adminOperations.validatorUrl = value;
                }}
              />
            </Box>
            <Box direction="column" style={{ width: '100%' }} gap="5px">
              <Text>Admin Password</Text>
              <TextInput type="password" value={value} onChange={onChange} />
            </Box>
            <Button
              size="large"
              onClick={() => {
                adminOperations.manager = value;
                adminOperations.fetch();
                actionModals.closeLastModal();
              }}
            >
              Sign in
            </Button>
          </Box>
        );
      },
      {
        title: 'Set Admin Password',
        applyText: '',
        closeText: '',
        noValidation: true,
        width: '500px',
        showOther: true,
        onApply: () => {
          return Promise.resolve();
        },
      },
    );
  }, []);

  useEffect(() => {
    changeValidator();
  }, []);

  const onChangeDataFlow = (props: any) => {
    adminOperations.onChangeDataFlow(props);
  };

  return (
    <BaseContainer>
      <PageContainer>
        <Box
          direction="row"
          align="center"
          justify="between"
          margin={{ vertical: 'xlarge' }}
          gap="20px"
        >
          <Box direction="row" align="center">
            <Title size="medium">
              Validator:
              <span style={{ color: '#47b8eb', margin: '0 0 0 10px' }}>
                {adminOperations.validatorUrl}
              </span>
            </Title>
            <Button transparent={true} onClick={() => changeValidator()}>
              (change)
            </Button>
          </Box>
          <StatisticBlock />
        </Box>

        <Box direction="row" gap="30px" justify="end">
          <Button style={{ background: '#c90000' }} onClick={() => reloadEvents(adminOperations.manager, 30000)}>
            Reload Harmony Events
          </Button>
          <Button style={{ background: '#c90000' }} onClick={() => reloadEvents(adminOperations.manager, 10000)}>
            Reload Ethereum Events
          </Button>
          <Button style={{ background: '#c90000' }} onClick={() => reloadEvents(adminOperations.manager, 10000)}>
            Reload Binance Events
          </Button>
        </Box>

        <Box
          direction="row"
          wrap={true}
          fill={true}
          justify="center"
          align="start"
          margin={{ top: 'medium' }}
        >
          <Box
            fill={true}
            direction="row"
            margin={{ bottom: 'medium' }}
            justify="between"
            align="center"
            gap="20px"
          >
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search by: txHash / address / amount / operation ID"
            />
            <Button
              onClick={() =>
                adminOperations.onChangeDataFlow({
                  filters: { search },
                })
              }
              style={{ width: 200 }}
            >
              Search
            </Button>
          </Box>

          <Box
            direction="row"
            justify="between"
            margin={{ bottom: 'small' }}
            gap="20px"
          >
            <Box direction="column" style={{ width: 300 }} gap="5px">
              <Text>Type:</Text>
              <Select
                size="full"
                options={[
                  { text: 'ALL', value: null },
                  { text: 'ETH -> HMY', value: EXCHANGE_MODE.ETH_TO_ONE },
                  { text: 'HMY -> ETH', value: EXCHANGE_MODE.ONE_TO_ETH },
                ]}
                onChange={value => {
                  adminOperations.onChangeDataFlow({
                    filters: { type: value },
                  });
                }}
              />
            </Box>

            <Box direction="column" style={{ width: 300 }} gap="5px">
              <Text>Operation STATUS:</Text>
              <Select
                size="full"
                options={[
                  { text: 'ALL', value: null },
                  { text: STATUS.SUCCESS, value: STATUS.SUCCESS },
                  { text: STATUS.IN_PROGRESS, value: STATUS.IN_PROGRESS },
                  { text: STATUS.WAITING, value: STATUS.WAITING },
                  { text: STATUS.ERROR, value: STATUS.ERROR },
                  { text: STATUS.CANCELED, value: STATUS.CANCELED },
                ]}
                onChange={value => {
                  adminOperations.onChangeDataFlow({
                    filters: { status: value },
                  });
                }}
              />
            </Box>

            <Box direction="column" style={{ width: 300 }} gap="5px">
              <Text>Token type:</Text>
              <Select
                size="full"
                options={[
                  { text: 'ALL', value: null },
                  { text: TOKEN.ERC20, value: TOKEN.ERC20 },
                  { text: TOKEN.BUSD, value: TOKEN.BUSD },
                  { text: TOKEN.LINK, value: TOKEN.LINK },
                  { text: TOKEN.HRC20, value: TOKEN.HRC20 },
                  { text: TOKEN.ERC721, value: TOKEN.ERC721 },
                  { text: TOKEN.HRC721, value: TOKEN.HRC721 },
                  { text: TOKEN.ERC1155, value: TOKEN.ERC1155 },
                  { text: TOKEN.HRC1155, value: TOKEN.HRC1155 },
                  { text: TOKEN.ONE, value: TOKEN.ONE },
                  { text: TOKEN.ETH, value: TOKEN.ETH },
                ]}
                onChange={value => {
                  adminOperations.onChangeDataFlow({
                    filters: { token: value },
                  });
                }}
              />
            </Box>

            <Box direction="column" style={{ width: 300 }} gap="5px">
              <Text>Network:</Text>
              <Select
                size="full"
                options={[
                  { text: 'ALL', value: null },
                  { text: NETWORK_TYPE.BINANCE, value: NETWORK_TYPE.BINANCE },
                  { text: NETWORK_TYPE.ETHEREUM, value: NETWORK_TYPE.ETHEREUM },
                ]}
                onChange={value => {
                  adminOperations.onChangeDataFlow({
                    filters: { network: value },
                  });
                }}
              />
            </Box>
          </Box>
          <Table
            data={adminOperations.data}
            columns={columns}
            isPending={adminOperations.isPending}
            dataLayerConfig={adminOperations.dataFlow}
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

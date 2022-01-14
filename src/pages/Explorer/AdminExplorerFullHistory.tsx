import * as React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { NavLink } from 'react-router-dom';

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

export const AdminExplorerFullHistory = observer((props: any) => {
  const { adminOperationsFull, user, tokens, actionModals } = useStores();

  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [columns, setColumns] = useState(getColumns({ user }));

  const [search, setSearch] = useState({
    amount: '',
    ethAddress: '',
    oneAddress: '',
  });

  const updateSearch = (filterName: keyof typeof search) => (value: string) => {
    setSearch({ ...search, [filterName]: value });
  };

  useEffect(() => {
    tokens.init();
    tokens.fetch();
    adminOperationsFull.init();
  }, [adminOperationsFull, tokens]);

  useEffect(() => {
    setColumns(getColumns({ user }, adminOperationsFull.manager));
  }, [
    user.oneRate,
    user.ethRate,
    tokens.data,
    tokens.fetchStatus,
    user,
    adminOperationsFull.manager,
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
                value={adminOperationsFull.validatorUrl}
                options={validators.map(v => ({ text: v, value: v }))}
                onChange={value => {
                  adminOperationsFull.validatorUrl = value;
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
                adminOperationsFull.manager = value;
                adminOperationsFull.fetch();
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
    adminOperationsFull.onChangeDataFlow(props);
  };

  return (
    <BaseContainer>
      <PageContainer>
        <Box align="end">
          <Button>
            <NavLink
              style={{ color: 'inherit', textDecoration: 'none' }}
              to="/admin-explorer"
            >
              Back
            </NavLink>
          </Button>
        </Box>
        <Box
          direction="row"
          align="center"
          justify="between"
          margin={{ bottom: 'xlarge' }}
          gap="20px"
        >
          <Box direction="row" align="center">
            <Title size="medium">
              Validator:
              <span style={{ color: '#47b8eb', margin: '0 0 0 10px' }}>
                {adminOperationsFull.validatorUrl}
              </span>
            </Title>
            <Button transparent={true} onClick={() => changeValidator()}>
              (change)
            </Button>
          </Box>
          <StatisticBlock />
        </Box>

        <Box direction="row" gap="30px" justify="end">
          <Button
            style={{ background: '#c90000' }}
            onClick={() => reloadEvents(adminOperationsFull.manager, 30000)}
          >
            Reload Harmony Events
          </Button>
          <Button
            style={{ background: '#c90000' }}
            onClick={() => reloadEvents(adminOperationsFull.manager, 10000)}
          >
            Reload Ethereum Events
          </Button>
          <Button
            style={{ background: '#c90000' }}
            onClick={() => reloadEvents(adminOperationsFull.manager, 10000)}
          >
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
            gap="small"
          >
            <SearchInput
              value={search.amount}
              onChange={updateSearch('amount')}
              placeholder="amount"
            />
            <SearchInput
              value={search.oneAddress}
              onChange={updateSearch('oneAddress')}
              placeholder="oneAddress"
            />
            <SearchInput
              value={search.ethAddress}
              onChange={updateSearch('ethAddress')}
              placeholder="ethAddress"
            />
            <Button
              onClick={() =>
                adminOperationsFull.onChangeDataFlow({
                  filters: { ...search },
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
                  adminOperationsFull.onChangeDataFlow({
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
                  adminOperationsFull.onChangeDataFlow({
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
                  adminOperationsFull.onChangeDataFlow({
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
                  adminOperationsFull.onChangeDataFlow({
                    filters: { network: value },
                  });
                }}
              />
            </Box>
          </Box>
          <Table
            data={adminOperationsFull.data}
            columns={columns}
            isPending={adminOperationsFull.isPending}
            dataLayerConfig={adminOperationsFull.dataFlow}
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

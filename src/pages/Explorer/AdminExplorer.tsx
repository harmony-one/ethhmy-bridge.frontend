import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { Box } from 'grommet';
import { BaseContainer, PageContainer } from 'components';
import { observer } from 'mobx-react-lite';
import stores, { useStores } from 'stores';
import { Table } from 'components/Table';
import { Spinner } from 'ui';
import { Button, Text } from 'components/Base';
import { getColumns, StatisticBlock } from './Common';
import { ExpandedRow } from './ExpandedRow';
import { Select } from '../../components/Base/components/Inputs/types';
import { Title } from '../../components/Base/components/Title';
import {
  ACTION_TYPE,
  EXCHANGE_MODE,
  IOperation,
  NETWORK_TYPE,
  STATUS,
  TOKEN,
} from '../../stores/interfaces';
import { validators } from '../../services';

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

export const AdminExplorer = observer((props: any) => {
  const { operations, user, tokens, actionModals } = useStores();

  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [columns, setColumns] = useState(getColumns({ user }));

  useEffect(() => {
    tokens.init();
    tokens.fetch();
    operations.init();
  }, [operations, tokens]);

  useEffect(() => {
    setColumns(getColumns({ user }, operations.manager));
  }, [
    user.oneRate,
    user.ethRate,
    tokens.data,
    tokens.fetchStatus,
    user,
    operations.manager,
  ]);

  const changeValidator = useCallback(() => {
    actionModals.open(
      () => {
        const [error, setError] = useState('');
        const [load, setLoad] = useState(true);
        const [user, setUser] = useState();

        useEffect(() => {
          fetch(`${stores.operations.validatorUrl}/auth/login/success`, {
            // method: 'get',
            credentials: 'include',
            mode: 'cors',
          })
            .then(response => {
              if (response.status === 200) return response.json();
              throw new Error('');
            })
            .then(responseJson => {
              setUser(responseJson.user);

              if (responseJson.user.role === 'ADMIN') {
                operations.manager = responseJson.user.id;
                operations.fetch();
                actionModals.closeLastModal();
              } else {
                setError(
                  'Your user role is guest, please ask admin to change it to get access to admin panel',
                );
              }
            })
            .catch(e => setError(e.message))
            .finally(() => setLoad(false));
        }, []);

        if (load) {
          return (
            <Box pad="large" justify="center" align="center">
              <Spinner />
            </Box>
          );
        }

        return (
          <Box pad="large" gap="30px">
            <Title>Choose your validator</Title>
            <Box direction="column" style={{ width: '100%' }} gap="5px">
              <Text>Validator Url:</Text>
              <Select
                size="full"
                value={operations.validatorUrl}
                options={validators.map(v => ({ text: v, value: v }))}
                onChange={value => {
                  operations.validatorUrl = value;
                }}
              />
            </Box>
            <div style={{ width: '100%' }}>
              <Button
                size="large"
                style={{ width: '100%' }}
                onClick={() => {
                  window.open(
                    `${stores.operations.validatorUrl}/auth/google`,
                    '_self',
                  );
                }}
              >
                {user ? 'Change User' : 'Sign in with Google'}
              </Button>
              {error && (
                <Box margin={{ top: 'medium' }} gap="10px">
                  {user && <Text>Hey, {user.name}</Text>}
                  <Text color="red">{error}</Text>
                </Box>
              )}
            </div>
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
    operations.onChangeDataFlow(props);
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
                {operations.validatorUrl}
              </span>
            </Title>
            <Button
              transparent={true}
              onClick={() => {
                fetch(`${stores.operations.validatorUrl}/auth/logout`, {
                  // method: 'get',
                  credentials: 'include',
                  mode: 'cors',
                }).finally(() => changeValidator());
              }}
            >
              change (sign out)
            </Button>
          </Box>
          <StatisticBlock />
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
                  operations.onChangeDataFlow({
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
                  operations.onChangeDataFlow({
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
                  { text: TOKEN.ONE, value: TOKEN.ONE },
                  { text: TOKEN.ETH, value: TOKEN.ETH },
                ]}
                onChange={value => {
                  operations.onChangeDataFlow({
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
                  operations.onChangeDataFlow({
                    filters: { network: value },
                  });
                }}
              />
            </Box>
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

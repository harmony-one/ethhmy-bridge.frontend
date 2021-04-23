import * as React from 'react';
import { useCallback, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Button } from '../../components/Base/components/Button';
import * as services from '../../services';
import { validators } from '../../services';
import { useStores } from '../../stores';
import { ACTION_TYPE, IOperation, STATUS } from '../../stores/interfaces';
import { Box } from 'grommet';
import { Title } from '../../components/Base/components/Title';
import { Text } from '../../components/Base/components/Text';
import { Select } from '../../components/Base/components/Inputs/types/Select';
import { TextInput } from '../../components/Base/components/Inputs/types';

export const ManageButton = observer((params: { operation: IOperation }) => {
  const { adminOperations, actionModals } = useStores();

  const reset = () => {
    return services.manage('reset', adminOperations.manager, {
      operationId: params.operation.id,
    });
  };

  const changeTx = useCallback(() => {
    actionModals.open(
      () => {
        const [action, setAction] = useState<ACTION_TYPE>();
        const [value, onChange] = useState('');

        return (
          <Box pad="large" gap="30px">
            <Title>Set transaction</Title>
            <Box direction="column" style={{ width: '100%' }} gap="5px">
              <Text>Action:</Text>
              <Select
                size="full"
                value={action}
                options={params.operation.actions.map(a => ({
                  text: a.type,
                  value: a.type,
                }))}
                onChange={setAction}
              />
            </Box>
            <Box direction="column" style={{ width: '100%' }} gap="5px">
              <Text>Transaction Hash</Text>
              <TextInput value={value} onChange={onChange} />
            </Box>
            <Button
              size="large"
              onClick={() => {
                services.manage('set_transaction', adminOperations.manager, {
                  operationId: params.operation.id,
                  actionType: action,
                  transactionHash: value,
                });

                adminOperations.fetch();
                actionModals.closeLastModal();
              }}
            >
              Set tx Hash
            </Button>
            <Box direction="column" fill={true} gap="10px" align="center">
              <Box fill={true} style={{ borderBottom: '1px solid grey' }} />
              <Button
                size="large"
                onClick={() => {
                  reset();
                  actionModals.closeLastModal()
                }}
              >
                Restart Operation
              </Button>
              <Box fill={true} style={{ borderBottom: '1px solid grey' }} />
              <Button
                size="large"
                onClick={() => actionModals.closeLastModal()}
              >
                Close Modal
              </Button>
            </Box>
          </Box>
        );
      },
      {
        title: '',
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

  return (
    <Box direction="column" gap="10px">
      <Button
        size="small"
        style={{ float: 'right', marginRight: 15 }}
        onClick={() => {
          changeTx();
        }}
      >
        Manage
      </Button>
    </Box>
  );
});

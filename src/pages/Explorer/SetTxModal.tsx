import React, { useState } from 'react';
import { useStores } from '../../stores';
import { ACTION_TYPE, IOperation } from '../../stores/interfaces';
import * as services from '../../services';
import { Box } from 'grommet';
import { Button, Select, Text, TextInput, Title } from '../../components/Base';
import { observer } from 'mobx-react';

interface Props {
  operation: IOperation,
}

export const SetTxModal: React.FC<Props> = observer(({operation}) => {
  const { adminOperations, actionModals } = useStores();
  const [action, setAction] = useState<ACTION_TYPE>();
  const [value, onChange] = useState('');

  const handleRestartOperation = () => {
    return services.manage('reset', adminOperations.manager, {
      operationId: operation.id,
    });
  };

  return (
    <Box pad="large" gap="30px">
      <Title>Set transaction</Title>
      <Box direction="column" style={{ width: '100%' }} gap="5px">
        <Text>Action:</Text>
        <Select
          size="full"
          value={action}
          options={operation.actions.map(a => ({
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
            operationId: operation.id,
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
            handleRestartOperation();
            actionModals.closeLastModal()
          }}
        >
          Restart Operation
        </Button>
      </Box>
    </Box>
  );

});

SetTxModal.displayName = 'SetTxModal';

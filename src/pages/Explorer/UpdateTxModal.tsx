import React, { useCallback, useState } from 'react';
import {
  EXCHANGE_MODE,
  IOperation,
  NETWORK_TYPE,
  TOKEN,
} from '../../stores/interfaces';
import { Box } from 'grommet';
import { Text, Button } from '../../components/Base';
import { NumberInput, Select, Form, Input } from '../../components/Form';
import { objKeys } from '../../services/helpers';
import { MobxForm } from '../../components/Form';
import { observable } from 'mobx';
import { observer } from 'mobx-react-lite';

interface Props {
  operation: IOperation;
}

function enumToSelectOptions<K extends string, V>(
  e: Record<K, V>,
): { text: K; value: V }[] {
  return objKeys(e).map(key => ({
    text: key,
    value: e[key],
  }));
}

const typeOptions = enumToSelectOptions(EXCHANGE_MODE);
const tokenOptions = enumToSelectOptions(TOKEN);
const networkOptions = enumToSelectOptions(NETWORK_TYPE);

const formData = observable({
  type: '',
  network: '',
  token: '',
  amount: '',
  oneAddress: '',
  ethAddress: '',
  erc20Address: '',
  hrc20Address: '',
  hrc721Address: '',
});

export const UpdateTxModal: React.FC<Props> = observer(({ operation }) => {
  const [form, setForm] = useState<MobxForm>();

  const handleSubmit = useCallback(() => {
    console.log('### create tx');
  }, []);

  return (
    <Form ref={ref => setForm(ref)} data={formData}>
      <Box gap="small">
        <Box>
          <Text>Type:</Text>
          <Select name="type" options={typeOptions} value={operation.type} />
        </Box>
        <Box>
          <Text>Network Type:</Text>
          <Select
            name="network"
            options={networkOptions}
            value={operation.network}
          />
        </Box>
        <Box>
          <Text>Token:</Text>
          <Select
            name="token"
            size="full"
            value={operation.token}
            options={tokenOptions}
          />
        </Box>
        <Box>
          <Text>Amount:</Text>
          <NumberInput value={operation.amount} name="amount" />
        </Box>
        <Box>
          <Text>oneAddress:</Text>
          <Input value={operation.oneAddress} name="oneAddress" />
        </Box>
        <Box>
          <Text>ethAddress:</Text>
          <Input value={operation.ethAddress} name="ethAddress" />
        </Box>
        {operation.erc20Address && (
          <Box>
            <Text>erc20Address:</Text>
            <Input value={operation.erc20Address} name="erc20Address" />
          </Box>
        )}
        {operation.hrc20Address && (
          <Box>
            <Text>hrc20Address:</Text>
            <Input value={operation.hrc20Address} name="hrc20Address" />
          </Box>
        )}
        {operation.hrc721Address && (
          <Box>
            <Text>hrc721Address:</Text>
            <Input value={operation.hrc721Address} name="hrc721Address" />
          </Box>
        )}
        <Button bgColor="#00ADE8" onClick={handleSubmit} transparent={false}>
          Create
        </Button>
      </Box>
    </Form>
  );
});

UpdateTxModal.displayName = 'UpdateTxModal';

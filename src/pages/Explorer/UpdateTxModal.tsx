import React, { useCallback, useMemo, useState } from 'react';
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
import { useStores } from '../../stores';
import { bridgeSDK } from './bridgeSDK';

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

export const UpdateTxModal: React.FC<Props> = observer(({ operation }) => {
  const [form, setForm] = useState<MobxForm>();
  const { actionModals } = useStores();
  const [isLoading, setLoading] = useState(false);

  const formData = useMemo(() => {
    return observable({
      type: operation.type,
      network: operation.network,
      token: operation.token,
      amount: operation.amount,
      oneAddress: operation.oneAddress,
      ethAddress: operation.ethAddress,
      erc20Address: operation.erc20Address,
      hrc20Address: operation.hrc20Address,
      hrc721Address: operation.hrc721Address,
    });
  }, [operation]);

  const handleSubmit = useCallback(() => {
    setLoading(true);
    bridgeSDK
      // @ts-ignore
      .createOperation(formData)
      .then(() => {
        setLoading(false);
        actionModals.closeLastModal();
      })
      .catch(err => {
        console.error('### err', err);
        setLoading(false);
      });
  }, [actionModals, formData]);

  return (
    <Form ref={ref => setForm(ref)} data={formData}>
      <Box gap="small">
        <Box>
          <Text>Type:</Text>
          <Select name="type" options={typeOptions} />
        </Box>
        <Box>
          <Text>Network Type:</Text>
          <Select name="network" options={networkOptions} />
        </Box>
        <Box>
          <Text>Token:</Text>
          <Select name="token" size="full" options={tokenOptions} />
        </Box>
        <Box>
          <Text>Amount:</Text>
          <NumberInput name="amount" />
        </Box>
        <Box>
          <Text>oneAddress:</Text>
          <Input type="string" name="oneAddress" />
        </Box>
        <Box>
          <Text>ethAddress:</Text>
          <Input type="string" name="ethAddress" />
        </Box>
        {operation.erc20Address && (
          <Box>
            <Text>erc20Address:</Text>
            <Input type="string" name="erc20Address" />
          </Box>
        )}
        {operation.hrc20Address && (
          <Box>
            <Input label="hrc20Address" type="string" name="hrc20Address" />
          </Box>
        )}
        {operation.hrc721Address && (
          <Box>
            <Text>hrc721Address:</Text>
            <Input type="string" name="hrc721Address" />
          </Box>
        )}
        <Button
          isLoading={isLoading}
          disabled={isLoading}
          bgColor="#00ADE8"
          onClick={handleSubmit}
          transparent={false}
        >
          Create
        </Button>
      </Box>
    </Form>
  );
});

UpdateTxModal.displayName = 'UpdateTxModal';

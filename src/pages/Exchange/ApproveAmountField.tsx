import * as React from 'react';
import { Box } from 'grommet';
import { NumberInput } from 'components/Form/Fields';
import { isRequired } from 'components/Form/validations';
import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import { useStores } from 'stores';
import { Spinner } from '../../ui/Spinner';
import { Text } from '../../components/Base/components/Text';
import { Checkbox } from '../../components/Base/components/Inputs/types';
import { maxAmount, minAmount } from '../../utils';

export const ApproveAmountField = observer<any>(({ tokenInfo }) => {
  const { exchange } = useStores();

  const [customAmount, setCustomAmount] = useState(false);

  if (exchange.allowanceStatus === 'fetching') {
    return <Spinner boxSize={12} />;
  }

  return (
    <>
      {exchange.allowanceError ? (
        <Box>
          <Text color="red">{exchange.allowanceError}</Text>
        </Box>
      ) : null}
      <Box direction="column" align="end" fill={true} margin={{ top: 'small' }}>
        <Box
          direction="row"
          align="center"
          justify="between"
          style={{ width: '100%' }}
        >
          <Text size="large" bold>
            Approve amount
          </Text>

          <Checkbox
            label="set custom amount"
            value={customAmount}
            onChange={setCustomAmount}
          />
        </Box>
        <Box
          direction="row"
          justify="between"
          margin={{ vertical: 'xsmall' }}
          style={{ width: '100%' }}
          fill={true}
        >
          <div style={{ width: '100%' }}>
            <NumberInput
              disabled={!customAmount}
              name="approveAmount"
              type="integer"
              precision="6"
              delimiter="."
              placeholder="0"
              style={{ width: '100%' }}
              rules={[
                isRequired,
                minAmount(Number(exchange.transaction.amount)),
              ]}
            />
          </div>
        </Box>
        <Text>
          You will need to approve amount for token manager. The minimum amount
          is equal to the amount of your transfer, but you can set a larger
          amount to save on approval later.
        </Text>
      </Box>
    </>
  );
});

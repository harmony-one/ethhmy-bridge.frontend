import * as React from 'react';
import { Box } from 'grommet';
import { observer } from 'mobx-react-lite';
import { useStores } from 'stores';
import { Button, TextInput, Title, Text } from 'components/Base';
import { useState } from 'react';

export const ERC20Select = observer(() => {
  const { userMetamask } = useStores();
  const [erc20, setERC20] = useState(userMetamask.erc20Address);
  const [error, setError] = useState('');

  return (
    <Box direction="column" margin={{ top: 'large' }}>
      <Text size="medium" bold>ERC20 token address</Text>
      <Box margin={{ top: 'xsmall', bottom: 'medium' }}>
        <TextInput
          placeholder="Input ERC20 token address"
          value={erc20}
          onChange={setERC20}
        />
      </Box>
      {error ? (
        <Box>
          <Text color="red">{error}</Text>
        </Box>
      ) : null}
      <Box direction="row" justify="end">
        <Button
          onClick={async () => {
            setError('');
            try {
              await userMetamask.setToken(erc20);
            } catch (e) {
              setError(e.message);
            }
          }}
        >
          Select token
        </Button>
      </Box>
    </Box>
  );
});

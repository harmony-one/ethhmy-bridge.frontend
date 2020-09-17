import * as React from 'react';
import { Box } from 'grommet';
import { observer } from 'mobx-react-lite';
import { useStores } from 'stores';
import { Button, TextInput, Title } from 'components/Base';
import { useState } from 'react';
import * as styles from './styles.styl';

export const ERC20Select = observer(() => {
  const { userMetamask } = useStores();
  const [erc20, setERC20] = useState(userMetamask.erc20Address);

  return (
    <Box
      direction="column"
      className={styles.exchangeContainer}
      pad={{ vertical: 'large', horizontal: '40px' }}
    >
      <Title>ERC20 token address</Title>
      <Box margin={{ top: 'large', bottom: 'medium' }}>
        <TextInput
          placeholder="Input ERC20 token address"
          value={erc20}
          onChange={setERC20}
        />
      </Box>
      <Box direction="row" justify="end">
        <Button
          onClick={() => {
            userMetamask.setToken(erc20);
          }}
        >
          Select token
        </Button>
      </Box>
    </Box>
  );
});

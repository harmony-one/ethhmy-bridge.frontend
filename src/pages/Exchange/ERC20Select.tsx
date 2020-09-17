import * as React from 'react';
import { Box } from 'grommet';
import { observer } from 'mobx-react-lite';
import { useStores } from 'stores';
import { TextInput, Title } from 'components/Base';
import { useState } from 'react';


export const ERC20Select = observer(() => {
  const { userMetamask } = useStores();
  const [erc20, setERC20] = useState('');

  return (
    <Box direction="column">
      <Title>Enter the address of the ERC20 token</Title>
      <Box margin={{ top: 'large' }}>
        <TextInput value={erc20} onChange={setERC20} />
      </Box>
    </Box>
  );
});

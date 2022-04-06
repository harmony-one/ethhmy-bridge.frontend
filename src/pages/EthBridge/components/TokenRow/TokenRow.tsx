import React from 'react';
import { Box } from 'grommet';
import { TokenControl } from '../TokenControl/TokenControl';
import { Icon } from '../../../../components/Base';
import { TokenAmount } from '../TokenAmount/TokenAmount';
import { TokenSettings } from '../TokenSettings/TokenSettings';
import { observer } from 'mobx-react';
import { useStores } from '../../../../stores';

interface Props {}

export const TokenRow: React.FC<Props> = observer(() => {
  const { erc20Select } = useStores();

  const token = erc20Select.tokensList.find(
    token => erc20Select.tokenAddress === token.address,
  );

  return (
    <Box direction="column" pad={{ top: '40px' }}>
      <Box justify="center" align="center" pad={{ bottom: '16px' }}>
        <TokenSettings />
      </Box>
      <Box direction="row" justify="center" align="center">
        <Box basis="0" flex="grow">
          <TokenControl />
        </Box>
        <Box>{token && <img src={token.image} width="40" />}</Box>
        <Box basis="0" flex="grow">
          <TokenAmount />
        </Box>
      </Box>
    </Box>
  );
});

TokenRow.displayName = 'TokenRow';

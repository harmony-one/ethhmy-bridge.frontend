import React from 'react';
import { Box } from 'grommet';
import { TokenControl } from '../TokenControl/TokenControl';
import { TokenAmount } from '../TokenAmount/TokenAmount';
import { TokenSettings } from '../TokenSettings/TokenSettings';
import { observer } from 'mobx-react';
import { useStores } from '../../../../../../stores';

interface Props {}

export const TokenRow: React.FC<Props> = observer(() => {
  const { exchange } = useStores();

  return (
    <Box direction="column">
      <Box justify="center" align="center" pad={{ bottom: '16px' }}>
        <TokenSettings />
      </Box>
      <Box direction="row" justify="center" align="center">
        <Box basis="0" flex="grow">
          <TokenControl />
        </Box>
        <Box>
          {exchange.tokenInfo && (
            <img src={exchange.tokenInfo.image} width="40" />
          )}
        </Box>
        <Box basis="0" flex="grow">
          <TokenAmount />
        </Box>
      </Box>
    </Box>
  );
});

TokenRow.displayName = 'TokenRow';

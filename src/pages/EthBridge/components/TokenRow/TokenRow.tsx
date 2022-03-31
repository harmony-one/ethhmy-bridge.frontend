import React from 'react';
import { Box } from 'grommet';
import { TokenControl } from '../TokenControl/TokenControl';
import { Icon } from '../../../../components/Base';
import { TokenAmount } from '../TokenAmount/TokenAmount';
import { Button } from 'grommet/components/Button';
import { Text } from '../../../../components/Base';
import { TokenSettings } from '../TokenSettings/TokenSettings';

interface Props {}

export const TokenRow: React.FC<Props> = () => {
  return (
    <Box direction="column" pad={{ top: '40px' }}>
      <Box justify="center" align="center" pad={{ bottom: '16px' }}>
        <TokenSettings />
      </Box>
      <Box direction="row" justify="center" align="center">
        <Box basis="0" flex="grow">
          <TokenControl />
        </Box>
        <Box>
          <Icon glyph="Binance" size="40" />
        </Box>
        <Box basis="0" flex="grow">
          <TokenAmount />
        </Box>
      </Box>
    </Box>
  );
};

TokenRow.displayName = 'TokenRow';

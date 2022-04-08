import React, { useEffect, useMemo } from 'react';
import { Box } from 'grommet';
import { TokenControl } from '../TokenControl/TokenControl';
import { Icon } from '../../../../components/Base';
import { TokenAmount } from '../TokenAmount/TokenAmount';
import { TokenSettings } from '../TokenSettings/TokenSettings';
import { observer } from 'mobx-react';
import { useStores } from '../../../../stores';

interface Props {}

export const TokenRow: React.FC<Props> = observer(() => {
  const { erc20Select, exchange } = useStores();

  const selectedToken = useMemo(() => {
    return erc20Select.tokensList.find(
      token => erc20Select.tokenAddress === token.address,
    );
  }, [erc20Select.tokenAddress, erc20Select.tokensList]);

  const selectedToken2 = exchange.tokenInfo;
  console.log('### selectedToken', selectedToken2);

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
          {selectedToken2 && <img src={selectedToken2.image} width="40" />}
        </Box>
        <Box basis="0" flex="grow">
          <TokenAmount />
        </Box>
      </Box>
    </Box>
  );
});

TokenRow.displayName = 'TokenRow';

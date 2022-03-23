import React from 'react';
import { NetworkButton } from '../NetworkButton/NetworkButton';
import { NETWORK_TYPE } from '../../../../stores/interfaces';
import { Box } from 'grommet';

interface Props {
  network: NETWORK_TYPE | 'ALL';
  setNetwork: (value: NETWORK_TYPE | 'ALL') => void;
}

export const FilterNetworkType: React.FC<Props> = React.memo(
  ({ network, setNetwork }) => {
    return (
      <Box direction="row" gap="9px">
        <NetworkButton
          type={'ALL'}
          selectedType={network}
          onClick={() => setNetwork('ALL')}
        />
        <NetworkButton
          type={NETWORK_TYPE.BINANCE}
          selectedType={network}
          onClick={() => setNetwork(NETWORK_TYPE.BINANCE)}
        />
        <NetworkButton
          type={NETWORK_TYPE.ETHEREUM}
          selectedType={network}
          onClick={() => setNetwork(NETWORK_TYPE.ETHEREUM)}
        />
      </Box>
    );
  },
);

FilterNetworkType.displayName = 'FilterNetworkType';

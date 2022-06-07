import React, { useCallback } from 'react';
import { Icon } from '../../../../../../components/Base';
import { Button } from 'grommet/components/Button';
import { useStores } from '../../../../../../stores';
import { EXCHANGE_MODE } from '../../../../../../stores/interfaces';
import { Transaction } from 'grommet-icons';
import { observer } from 'mobx-react';

interface Props {}

export const NetworkDirection: React.FC<Props> = observer(() => {
  const { exchange, userMetamask } = useStores();

  const handleChangeMode = useCallback(() => {
    if (exchange.mode === EXCHANGE_MODE.ONE_TO_ETH) {
      exchange.setMode(EXCHANGE_MODE.ETH_TO_ONE);
      // userMetamask.switchNetwork(EXCHANGE_MODE.ETH_TO_ONE, exchange.network);
    } else {
      exchange.setMode(EXCHANGE_MODE.ONE_TO_ETH);
      // userMetamask.switchNetwork(EXCHANGE_MODE.ONE_TO_ETH, exchange.network);
    }
  }, [exchange, userMetamask]);

  return (
    <Button onClick={handleChangeMode} style={{ width: '40px' }}>
      <Transaction />
    </Button>
  );
});

NetworkDirection.displayName = 'NetworkDirection';

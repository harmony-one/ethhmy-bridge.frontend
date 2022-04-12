import React, { useCallback } from 'react';
import { Icon } from '../../../../../../components/Base';
import { Button } from 'grommet/components/Button';
import { useStores } from '../../../../../../stores';
import { EXCHANGE_MODE } from '../../../../../../stores/interfaces';
import { observer } from 'mobx-react';

interface Props {}

export const NetworkDirection: React.FC<Props> = observer(() => {
  const { exchange } = useStores();

  const handleChangeMode = useCallback(() => {
    if (exchange.mode === EXCHANGE_MODE.ONE_TO_ETH) {
      exchange.setMode(EXCHANGE_MODE.ETH_TO_ONE);
    } else {
      exchange.setMode(EXCHANGE_MODE.ONE_TO_ETH);
    }
  }, [exchange, exchange.mode]);

  return (
    <Button onClick={handleChangeMode} style={{ width: '40px' }}>
      <Icon glyph="Switch" />
    </Button>
  );
});

NetworkDirection.displayName = 'NetworkDirection';

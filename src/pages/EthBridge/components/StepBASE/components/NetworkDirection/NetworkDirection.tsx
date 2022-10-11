import React, { useCallback } from 'react';
import { Icon } from '../../../../../../components/Base';
import { Button } from 'grommet/components/Button';
import { useStores } from '../../../../../../stores';
import { EXCHANGE_MODE } from '../../../../../../stores/interfaces';
import { Transaction } from 'grommet-icons';
import { observer } from 'mobx-react';

interface Props {}

export const NetworkDirection: React.FC<Props> = observer(() => {
  const { bridgeFormStore } = useStores();

  const handleChangeMode = useCallback(() => {
    bridgeFormStore.toggleExchangeMode();
  }, [bridgeFormStore]);

  return (
    <Button onClick={handleChangeMode} style={{ width: '40px' }}>
      <Transaction />
    </Button>
  );
});

NetworkDirection.displayName = 'NetworkDirection';

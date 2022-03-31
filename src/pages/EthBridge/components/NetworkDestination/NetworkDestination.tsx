import React from 'react';
import { EXCHANGE_MODE } from '../../../../stores/interfaces';
import { observer } from 'mobx-react';
import { useStores } from '../../../../stores';
import { NetworkHarmony } from '../NetworkHarmony/NetworkHarmony';
import { NetworkExternal } from '../NetworkExternal/NetworkExternal';

interface Props {}

export const NetworkDestination: React.FC<Props> = observer(() => {
  const { exchange } = useStores();

  if (exchange.mode === EXCHANGE_MODE.ETH_TO_ONE) {
    return <NetworkHarmony title="To" />;
  }

  return <NetworkExternal title="To" />;
});

NetworkDestination.displayName = 'NetworkDestination';

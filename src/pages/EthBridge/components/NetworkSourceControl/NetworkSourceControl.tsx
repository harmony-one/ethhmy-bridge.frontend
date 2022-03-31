import React from 'react';
import { useStores } from '../../../../stores';
import { EXCHANGE_MODE } from '../../../../stores/interfaces';
import { observer } from 'mobx-react';
import { NetworkExternal } from '../NetworkExternal/NetworkExternal';
import { NetworkHarmony } from '../NetworkHarmony/NetworkHarmony';

interface Props {}

export const NetworkSourceControl: React.FC<Props> = observer(() => {
  const { exchange } = useStores();

  if (exchange.mode === EXCHANGE_MODE.ETH_TO_ONE) {
    return <NetworkExternal title="From" />;
  }

  return <NetworkHarmony title="From" />;
});

NetworkSourceControl.displayName = 'NetworkSourceControl';

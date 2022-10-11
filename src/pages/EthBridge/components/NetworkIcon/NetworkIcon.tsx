import React from 'react';
import { Icon } from '../../../../components/Base';
import { NETWORK_TYPE } from '../../../../stores/interfaces';

type IconName = 'Ethereum' | 'Harmony' | 'Binance';

interface Props {
  network: NETWORK_TYPE;
}

const iconMap: Record<NETWORK_TYPE, IconName> = {
  [NETWORK_TYPE.HARMONY]: 'Harmony',
  [NETWORK_TYPE.ETHEREUM]: 'Ethereum',
  [NETWORK_TYPE.BINANCE]: 'Binance',
};

export const NetworkIcon: React.FC<Props> = ({ network }) => {
  const glyph = iconMap[network];
  return <Icon size="32" glyph={glyph} />;
};

NetworkIcon.displayName = 'NetworkIcon';

import { NETWORK_TYPE } from '../../stores/interfaces';

export const networkNameMap: Record<NETWORK_TYPE, string> = {
  [NETWORK_TYPE.HARMONY]: 'Harmony',
  [NETWORK_TYPE.ETHEREUM]: 'Ethereum',
  [NETWORK_TYPE.BINANCE]: 'Binance',
};

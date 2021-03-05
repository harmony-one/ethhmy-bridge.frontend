import { NETWORK_TYPE } from './interfaces';

export const NETWORK_NAME = {
  [NETWORK_TYPE.ETHEREUM]: 'Ethereum',
  [NETWORK_TYPE.BINANCE]: 'Binance',
};

export const NETWORK_ICON = {
  [NETWORK_TYPE.ETHEREUM]: '/eth.svg',
  [NETWORK_TYPE.BINANCE]: '/binance.png',
};

export const NETWORK_BASE_TOKEN = {
  [NETWORK_TYPE.ETHEREUM]: 'ETH',
  [NETWORK_TYPE.BINANCE]: 'BNB',
};

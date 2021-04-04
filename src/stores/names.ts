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

export const NETWORK_ERC20_TOKEN = {
  [NETWORK_TYPE.ETHEREUM]: 'ERC20',
  [NETWORK_TYPE.BINANCE]: 'BEP20',
};


export const NETWORK_PREFIX = {
  [NETWORK_TYPE.ETHEREUM]: '1',
  [NETWORK_TYPE.BINANCE]: 'bsc',
};

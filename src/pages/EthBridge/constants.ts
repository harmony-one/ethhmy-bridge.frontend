import { NETWORK_TYPE, TOKEN } from '../../stores/interfaces';

export const networkNameMap: Record<NETWORK_TYPE, string> = {
  [NETWORK_TYPE.HARMONY]: 'Harmony',
  [NETWORK_TYPE.ETHEREUM]: 'Ethereum',
  [NETWORK_TYPE.BINANCE]: 'Binance',
};

export const tokenConfig = {
  [TOKEN.LINK]: {
    name: 'LINK',
    label: 'Chainlink',
    icon: '/link.png',
    proxyERC20: '0xEe381e476b4335B8584A2026f3E845edaC2c69de',
    proxyHRC20: '0x6bEe6e5cf8E02833550B228D9CC6aD19Dae3743E',
    erc20Address: '0x514910771af9ca656af840dff83e8264ecf986ca',
    hrc20Address: '0x218532a12a389a4a92fc0c5fb22901d1c19198aa',
  },
  [TOKEN.BUSD]: {
    name: 'BUSD',
    label: 'Binance USD',
    icon: '/busd.svg',
  },
  [TOKEN.ETH]: {
    name: 'ETH',
    label: 'Ethereum',
    icon: '/eth.svg',
  },
  [TOKEN.ONE]: {
    name: 'ONE',
    label: 'Harmony',
    icon: '/one.svg',
  },
};

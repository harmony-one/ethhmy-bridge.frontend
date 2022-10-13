import { ITokenInfo, NETWORK_TYPE, TOKEN } from 'stores/interfaces';

export const layerZeroConfig = {
  ethereum: {
    endpoint: '0x66A71Dcef29A0fFBDBE3c6a460a3B5BC225Cd675',
    chainId: 101,
  },
  bsc: {
    endpoint: '0x3c2269811836af69497E5F486A85D7316753cf62',
    chainId: 102,
  },
  harmony: {
    endpoint: '0x9740FF91F1985D8d2B71494aE1A2f723bb3Ed9E4',
    chainId: 116,
  },
};

// 1LINK token addresses
export const tokensConfigs: ITokenInfo[] = [
  {
    proxyERC20: '0xEe381e476b4335B8584A2026f3E845edaC2c69de',
    proxyHRC20: '0x6bEe6e5cf8E02833550B228D9CC6aD19Dae3743E',
    erc20Address: '0x514910771af9ca656af840dff83e8264ecf986ca',
    hrc20Address: '0x218532a12a389a4a92fc0c5fb22901d1c19198aa',
    //
    name: 'ChainLink Token',
    symbol: 'LINK',
    decimals: '18',
    image: '/link.png',
    totalLocked: '0',
    totalSupply: '0',
    totalLockedNormal: '0',
    totalLockedUSD: '0',
    token: TOKEN.ERC20,
    type: TOKEN.ERC20,
    network: NETWORK_TYPE.ETHEREUM,
  },
];

export const getTokenConfig = (addr: string): ITokenInfo => {
  return tokensConfigs.find(
    t =>
      t.erc20Address.toUpperCase() === addr.toUpperCase() ||
      t.hrc20Address.toUpperCase() === addr.toUpperCase(),
  );
};

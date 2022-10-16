import { ITokenInfo, NETWORK_TYPE, TOKEN } from 'stores/interfaces';
import stores from './stores';

export const layerZeroConfig = {
    ethereum: {
        endpoint: '0x66A71Dcef29A0fFBDBE3c6a460a3B5BC225Cd675',
        chainId: 101,
    },
    binance: {
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
    {
        erc20Address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        hrc20Address: '0xBC594CABd205bD993e7FfA6F3e9ceA75c1110da5',
        proxyERC20: '0x4f52b41a778761bd2eea5b7b7ed8cbdaa02cef3e',
        proxyHRC20: '0xfB5a2461D49D83348C557A5Ad7AA938DCF444d7f',
        name: 'USD Coin',
        symbol: 'USDC',
        decimals: '6',
        totalLocked: '0',
        totalSupply: '0',
        totalLockedNormal: '0',
        totalLockedUSD: '0',
        token: TOKEN.ERC20,
        type: TOKEN.ERC20,
        network: NETWORK_TYPE.ETHEREUM,
    },
    {
        hrc20Address: '0xF2732e8048f1a411C63e2df51d08f4f52E598005',
        erc20Address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
        proxyERC20: '0xF6a097b278383eF0A800ABD7d700b29B159B19b5',
        proxyHRC20: '0x9e61d6A7B4746922E68D710d9454D3558BC8dF1C',
        name: 'Tether USD',
        symbol: 'USDT',
        decimals: '6',
        totalLocked: '0',
        totalSupply: '0',
        totalLockedNormal: '0',
        totalLockedUSD: '0',
        token: TOKEN.ERC20,
        type: TOKEN.ERC20,
        network: NETWORK_TYPE.ETHEREUM,
    },
    {
        hrc20Address: '0xd068722E4e1387E4958300D1e625d2878f784125',
        erc20Address: '0x6b175474e89094c44da98b954eedeac495271d0f',
        proxyERC20: '0x85db5268403700e901285E8B8Fb0CADf4212B95E',
        proxyHRC20: '0x664491FD329a1b98d83Cf585CC2e54af5Ab11CBD',
        name: 'Dai Stablecoin',
        symbol: 'DAI',
        decimals: '18',
        totalLocked: '0',
        totalSupply: '0',
        totalLockedNormal: '0',
        totalLockedUSD: '0',
        token: TOKEN.ERC20,
        type: TOKEN.ERC20,
        network: NETWORK_TYPE.ETHEREUM,
    },
    {
        hrc20Address: '0xFeee03BFBAA49dc8d11DDAab8592546018dfb709',
        erc20Address: '0x4fabb145d64652a948d72533023f6e7a623c7c53',
        proxyERC20: '0xAd7514b8B1EADFad8B1Ff0873Dba52E304C87446',
        proxyHRC20: '0xaDC74a8D0A066519252eF2C61776552e7bD2ab8c',
        name: 'Binance USD',
        symbol: 'BUSD',
        decimals: '18',
        totalLocked: '0',
        totalSupply: '0',
        totalLockedNormal: '0',
        totalLockedUSD: '0',
        token: TOKEN.ERC20,
        type: TOKEN.ERC20,
        network: NETWORK_TYPE.ETHEREUM,
    },
    {
        hrc20Address: '0x1Aa1F7815103c0700b98f24138581b88d4cf9769',
        erc20Address: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
        proxyERC20: '0x98e871aB1cC7e3073B6Cc1B661bE7cA678A33f7F',
        proxyHRC20: '0x10681e186C5A9565230BADd8c9422bf26C2D8B21',
        name: 'Binance-Peg BUSD TokenBinance-Peg BUSD Token',
        symbol: 'BUSD',
        decimals: '18',
        totalLocked: '0',
        totalSupply: '0',
        totalLockedNormal: '0',
        totalLockedUSD: '0',
        token: TOKEN.ERC20,
        type: TOKEN.ERC20,
        network: NETWORK_TYPE.BINANCE,
    },
    {
        hrc20Address: '0x0',
        erc20Address: '0x03fF0ff224f904be3118461335064bB48Df47938',
        proxyERC20: '0x55b9b75F2D456D010e6b8c6F62544c6EfC1c101D',
        proxyHRC20: '0xAa76A3b0295874404965DBE07053EE98Afab7fc4',
        name: 'Harmony ONE',
        symbol: 'ONE',
        decimals: '18',
        totalLocked: '0',
        totalSupply: '0',
        totalLockedNormal: '0',
        totalLockedUSD: '0',
        token: TOKEN.ONE,
        type: TOKEN.ONE,
        network: NETWORK_TYPE.BINANCE,
    }
];

export const getTokenConfig = (addr: string): ITokenInfo => {
    let token: ITokenInfo;

    if (stores.exchange.token === TOKEN.ERC20) {
        token = tokensConfigs.find(
            t =>
                t.erc20Address.toUpperCase() === addr.toUpperCase() ||
                t.hrc20Address.toUpperCase() === addr.toUpperCase(),
        );
    }

    if ([TOKEN.ONE, TOKEN.ETH].includes(stores.exchange.token)) {
        token = tokensConfigs.find(
            t =>
                t.type === stores.exchange.token && t.network === stores.exchange.network
        );
    }

    const config = layerZeroConfig[token.network.toLowerCase()];

    return { ...token, config };
};

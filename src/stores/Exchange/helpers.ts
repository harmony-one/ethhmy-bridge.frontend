import { EXCHANGE_MODE, NETWORK_TYPE, TOKEN } from '../interfaces';
import * as contract from '../../blockchain-bridge';
import { getExNetworkMethods } from '../../blockchain-bridge';

export const getContractMethods = (
  token: TOKEN,
  network: NETWORK_TYPE,
  isMetamask: boolean,
) => {
  let ethMethods, hmyMethods;

  const exNetwork = getExNetworkMethods();

  switch (token) {
    case TOKEN.BUSD:
      ethMethods = exNetwork.ethMethodsBUSD;
      hmyMethods = isMetamask
        ? contract.hmyMethodsBUSD.hmyMethodsWeb3
        : contract.hmyMethodsBUSD.hmyMethods;
      break;

    case TOKEN.LINK:
      ethMethods = exNetwork.ethMethodsLINK;
      hmyMethods = isMetamask
        ? contract.hmyMethodsLINK.hmyMethodsWeb3
        : contract.hmyMethodsLINK.hmyMethods;
      break;

    case TOKEN.ERC20:
      ethMethods = exNetwork.ethMethodsERC20;

      if (network === NETWORK_TYPE.ETHEREUM) {
        hmyMethods = isMetamask
          ? contract.hmyMethodsERC20.hmyMethodsWeb3
          : contract.hmyMethodsERC20.hmyMethods;
      } else {
        hmyMethods = isMetamask
          ? contract.hmyMethodsBEP20.hmyMethodsWeb3
          : contract.hmyMethodsBEP20.hmyMethods;
      }
      break;

    case TOKEN.HRC721:
      ethMethods = exNetwork.ethMethodsHRC721;
      hmyMethods = isMetamask
        ? contract.hmyMethodsHRC721.hmyMethodsWeb3
        : contract.hmyMethodsHRC721.hmyMethods;
      break;
    case TOKEN.HRC1155:
      ethMethods = exNetwork.ethMethodsHRC1155;
      hmyMethods = isMetamask
        ? contract.hmyMethodsHRC1155.hmyMethodsWeb3
        : contract.hmyMethodsHRC1155.hmyMethods;
      break;
    case TOKEN.ERC1155:
      ethMethods = exNetwork.ethMethodsERC1155;
      hmyMethods = isMetamask
        ? contract.hmyMethodsERC1155.hmyMethodsWeb3
        : contract.hmyMethodsERC1155.hmyMethods;
      break;
    case TOKEN.ERC721:
      ethMethods = exNetwork.ethMethodsERС721;
      hmyMethods = isMetamask
        ? contract.hmyMethodsERC721.hmyMethodsWeb3
        : contract.hmyMethodsERC721.hmyMethods;
      break;

    case TOKEN.HRC20:
      ethMethods = exNetwork.ethMethodsHRC20;
      if (network === NETWORK_TYPE.ETHEREUM) {
        hmyMethods = isMetamask
          ? contract.hmyMethodsHRC20.hmyMethodsWeb3
          : contract.hmyMethodsHRC20.hmyMethods;
      } else {
        hmyMethods = isMetamask
          ? contract.hmyMethodsBHRC20.hmyMethodsWeb3
          : contract.hmyMethodsBHRC20.hmyMethods;
      }
      break;

    case TOKEN.ETH:
      ethMethods = exNetwork.ethMethodsBUSD;
      hmyMethods = isMetamask
        ? contract.hmyMethodsERC20.hmyMethodsWeb3
        : contract.hmyMethodsERC20.hmyMethods;
      break;

    case TOKEN.ONE:
      ethMethods = exNetwork.ethMethodsHRC20;
      hmyMethods = isMetamask
        ? contract.hmyMethodsHRC20.hmyMethodsWeb3
        : contract.hmyMethodsHRC20.hmyMethods;
      break;
  }

  return { ethMethods, hmyMethods };
};

interface MetaMaskNetworkConfig {
  chainId: string;
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls: string[];
}

export const numberToHex = (value: number): string => {
  return '0x' + value.toString(16);
};

const BinanceConfig: MetaMaskNetworkConfig = {
  chainId: numberToHex(parseInt(process.env.METAMASK_BSC_CHAIN_ID, 10)),
  chainName: process.env.METAMASK_BSC_CHAIN_NAME,
  nativeCurrency: {
    name: 'BNB',
    symbol: 'BNB',
    decimals: 18,
  },
  rpcUrls: [process.env.METAMASK_BSC_RPC_URL],
  blockExplorerUrls: [process.env.METAMASK_BSC_EXPLORER],
};

const HarmonyConfig: MetaMaskNetworkConfig = {
  chainId: numberToHex(parseInt(process.env.METAMASK_HMY_CHAIN_ID, 10)),
  chainName: process.env.METAMASK_BSC_CHAIN_NAME,
  nativeCurrency: {
    name: 'ONE',
    symbol: 'ONE',
    decimals: 18,
  },
  rpcUrls: [process.env.METAMASK_HMY_RPC_URL],
  blockExplorerUrls: [process.env.HMY_EXPLORER_URL],
};

const EthereumConfig: MetaMaskNetworkConfig = {
  chainId: numberToHex(parseInt(process.env.METAMASK_ETH_CHAIN_ID, 10)),
  chainName: process.env.METAMASK_ETH_CHAIN_NAME,
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: [process.env.METAMASK_ETH_RPC_URL],
  blockExplorerUrls: [process.env.ETH_EXPLORER_URL],
};

export const getChainConfig = (mode: EXCHANGE_MODE, network: NETWORK_TYPE) => {
  if (mode === EXCHANGE_MODE.ONE_TO_ETH) {
    return HarmonyConfig;
  }

  if (network === NETWORK_TYPE.ETHEREUM) {
    return EthereumConfig;
  }

  if (network === NETWORK_TYPE.BINANCE) {
    return BinanceConfig;
  }

  throw new Error('Unhandled network type');
};

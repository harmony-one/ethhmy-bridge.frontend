import { NETWORK_TYPE, TOKEN } from '../interfaces';
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
    case TOKEN.HRC721:{
      ethMethods = exNetwork.ethMethodsHRC721;
      const networkMap = {
        [NETWORK_TYPE.ETHEREUM]: contract.hmyMethodsHRC721,
        [NETWORK_TYPE.BINANCE]: contract.hmyMethodsBHRC721,
        [NETWORK_TYPE.POLYGON]: contract.hmyMethodsPHRC721,
      }
      hmyMethods = isMetamask
        ? networkMap[network].hmyMethodsWeb3
        : networkMap[network].hmyMethods
      break;
    }
    case TOKEN.HRC1155:{
      ethMethods = exNetwork.ethMethodsHRC1155;
      const networkMap = {
        [NETWORK_TYPE.ETHEREUM]: contract.hmyMethodsHRC1155,
        [NETWORK_TYPE.BINANCE]: contract.hmyMethodsBHRC1155,
        [NETWORK_TYPE.POLYGON]: contract.hmyMethodsPHRC1155,
      }
      hmyMethods = isMetamask
        ? networkMap[network].hmyMethodsWeb3
        : networkMap[network].hmyMethods
      break;
    }
    case TOKEN.ERC1155:{
      ethMethods = exNetwork.ethMethodsERC1155;
      const networkMap = {
        [NETWORK_TYPE.ETHEREUM]: contract.hmyMethodsERC1155,
        [NETWORK_TYPE.BINANCE]: contract.hmyMethodsBEP1155,
        [NETWORK_TYPE.POLYGON]: contract.hmyMethodsPERC1155,
      }

      hmyMethods = isMetamask
        ? networkMap[network].hmyMethodsWeb3
        : networkMap[network].hmyMethods
      break;
    }
    case TOKEN.ERC721:{
      ethMethods = exNetwork.ethMethodsERС721;
      const networkMap = {
        [NETWORK_TYPE.ETHEREUM]: contract.hmyMethodsERC721,
        [NETWORK_TYPE.BINANCE]: contract.hmyMethodsBEP721,
        [NETWORK_TYPE.POLYGON]: contract.hmyMethodsPERC721,
      }

      hmyMethods = isMetamask
        ? networkMap[network].hmyMethodsWeb3
        : networkMap[network].hmyMethods
      break;
    }
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

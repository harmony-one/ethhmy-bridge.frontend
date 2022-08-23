import { NETWORK_TYPE, TOKEN } from '../interfaces';
import * as contract from '../../blockchain-bridge';
import { getExNetworkMethods, hmyMethodsS0HRC20, hmyMethodsS1HRC20 } from '../../blockchain-bridge';

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

    case TOKEN.ERC20:{
      ethMethods = exNetwork.ethMethodsERC20;

      const networkMap = {
        [NETWORK_TYPE.ETHEREUM]: contract.hmyMethodsERC20,
        [NETWORK_TYPE.BINANCE]: contract.hmyMethodsBEP20,
        [NETWORK_TYPE.HARMONYSHARD1]: contract.hmyMethodsS1HRC20,
      }

      hmyMethods = isMetamask
        ? networkMap[network].hmyMethodsWeb3
        : networkMap[network].hmyMethods
      break;
    }
    case TOKEN.HRC721:{
      ethMethods = exNetwork.ethMethodsHRC721;
      const networkMap = {
        [NETWORK_TYPE.ETHEREUM]: contract.hmyMethodsHRC721,
        [NETWORK_TYPE.HARMONYSHARD1]: contract.hmyMethodsS0HRC721,
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
        [NETWORK_TYPE.HARMONYSHARD1]: contract.hmyMethodsS0HRC1155,
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
        [NETWORK_TYPE.HARMONYSHARD1]: contract.hmyMethodsS1HRC1155,
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
        [NETWORK_TYPE.HARMONYSHARD1]: contract.hmyMethodsS1HRC721,
      }

      hmyMethods = isMetamask
        ? networkMap[network].hmyMethodsWeb3
        : networkMap[network].hmyMethods
      break;
    }
    case TOKEN.HRC20:{
      ethMethods = exNetwork.ethMethodsHRC20;
      const networkMap = {
        [NETWORK_TYPE.ETHEREUM]: contract.hmyMethodsHRC20,
        [NETWORK_TYPE.BINANCE]: contract.hmyMethodsBHRC20,
        [NETWORK_TYPE.HARMONYSHARD1]: contract.hmyMethodsS0HRC20,
      }

      hmyMethods = isMetamask
        ? networkMap[network].hmyMethodsWeb3
        : networkMap[network].hmyMethods

      break;
    }
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

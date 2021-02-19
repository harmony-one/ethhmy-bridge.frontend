import { TOKEN } from '../interfaces';
import * as contract from '../../blockchain-bridge';

export const getContractMethods = (
  token: TOKEN,
  isMetamask: boolean,
) => {
  let ethMethods, hmyMethods;

  switch (token) {
    case TOKEN.BUSD:
      ethMethods = contract.ethMethodsBUSD;
      hmyMethods = isMetamask
        ? contract.hmyMethodsBUSD.hmyMethodsWeb3
        : contract.hmyMethodsBUSD.hmyMethods;
      break;

    case TOKEN.LINK:
      ethMethods = contract.ethMethodsLINK;
      hmyMethods = isMetamask
        ? contract.hmyMethodsLINK.hmyMethodsWeb3
        : contract.hmyMethodsLINK.hmyMethods;
      break;

    case TOKEN.ERC20:
      ethMethods = contract.ethMethodsERC20;
      hmyMethods = isMetamask
        ? contract.hmyMethodsERC20.hmyMethodsWeb3
        : contract.hmyMethodsERC20.hmyMethods;
      break;

    case TOKEN.ERC721:
      ethMethods = contract.ethMethodsERС721;
      hmyMethods = isMetamask
        ? contract.hmyMethodsERC721.hmyMethodsWeb3
        : contract.hmyMethodsERC721.hmyMethods;
      break;

    case TOKEN.HRC20:
      ethMethods = contract.ethMethodsHRC20;
      hmyMethods = isMetamask
        ? contract.hmyMethodsHRC20.hmyMethodsWeb3
        : contract.hmyMethodsHRC20.hmyMethods;
      break;

    case TOKEN.ETH:
      ethMethods = contract.ethMethodsBUSD;
      hmyMethods = isMetamask
        ? contract.hmyMethodsERC20.hmyMethodsWeb3
        : contract.hmyMethodsERC20.hmyMethods;
      break;

    case TOKEN.ONE:
      ethMethods = contract.ethMethodsHRC20;
      hmyMethods = isMetamask
        ? contract.hmyMethodsHRC20.hmyMethodsWeb3
        : contract.hmyMethodsHRC20.hmyMethods;
      break;
  }

  return { ethMethods, hmyMethods };
};

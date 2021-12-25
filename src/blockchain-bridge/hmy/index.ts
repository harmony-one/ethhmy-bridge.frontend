import Web3 from 'web3';
import { HmyMethods } from './HmyMethods';
import { HmyMethodsDeposit } from './HmyMethodsDeposit';
import { HmyMethodsWeb3 } from './HmyMethodsWeb3';
import { HmyMethodsDepositWeb3 } from './HmyMethodsDepositWeb3';
import { HmyMethodsERC20 } from './HmyMethodsERC20';
import { HmyMethodsHRC20 } from './HmyMethodsHRC20';
import { HmyMethodsERC20Web3 } from './HmyMethodsERC20Web3';
import { HmyMethodsHRC20Web3 } from './HmyMethodsHRC20Web3';
import { HmyMethodsHRC721Web3 } from './HmyMethodsHRC721Web3';
import { HmyMethodsHRC721 } from './HmyMethodsHRC721';
import { HmyMethodsHRC1155 } from './HmyMethodsHRC1155';
import { HmyMethodsHRC1155Web3 } from './HmyMethodsHRC1155Web3';
import { HmyMethodsERC1155 } from './HmyMethodsERC1155';
import { HmyMethodsERC1155Web3 } from './HmyMethodsERC1155Web3';

const { Harmony } = require('@harmony-js/core');
const { ChainType } = require('@harmony-js/utils');

export const hmy = new Harmony(
  // let's assume we deploy smart contract to this end-point URL
  process.env.HMY_NODE_URL,
  {
    chainType: ChainType.Harmony,
    chainId: Number(process.env.HMY_CHAIN_ID),
  },
);

// @ts-ignore
const web3URL = window.ethereum ? window.ethereum : process.env.HMY_NODE_URL;

export const hmyWeb3 = new Web3(web3URL);

const createContract = (abi, address) => {
  const hmyContract = hmy.contracts.createContract(abi, address);

  const web3Contract = new hmyWeb3.eth.Contract(abi, address);

  return {
    hmyContract,
    web3Contract,
  };
};

const createMethods = (
  hmyTokenContract: any,
  hmyManagerContract: any,
  hmyManagerContractAddress,
) => {
  const hmyMethods = new HmyMethods({
    hmy: hmy,
    hmyTokenContract: hmyTokenContract.hmyContract,
    hmyManagerContract: hmyManagerContract.hmyContract,
  });

  const hmyMethodsWeb3 = new HmyMethodsWeb3({
    web3: hmyWeb3,
    hmyTokenContract: hmyTokenContract.web3Contract,
    hmyManagerContract: hmyManagerContract.web3Contract,
    hmyManagerContractAddress,
  });

  return {
    hmyMethods,
    hmyMethodsWeb3,
  };
};

const hmyBUSDJson = require('../out/MyERC20');
const hmyBUSDManagerJson = require('../out/LINKHmyManager');
const hmyBUSDContract = createContract(
  hmyBUSDJson.abi,
  process.env.HMY_BUSD_CONTRACT,
);
const hmyBUSDManagerContract = createContract(
  hmyBUSDManagerJson.abi,
  process.env.HMY_BUSD_MANAGER_CONTRACT,
);
const hmyLINKContract = createContract(
  hmyBUSDJson.abi,
  process.env.HMY_LINK_CONTRACT,
);
const hmyLINKManagerContract = createContract(
  hmyBUSDManagerJson.abi,
  process.env.HMY_LINK_MANAGER_CONTRACT,
);

export const hmyMethodsBUSD = createMethods(
  hmyBUSDContract,
  hmyBUSDManagerContract,
  process.env.HMY_BUSD_MANAGER_CONTRACT,
);
export const hmyMethodsLINK = createMethods(
  hmyLINKContract,
  hmyLINKManagerContract,
  process.env.HMY_LINK_MANAGER_CONTRACT,
);

const ercBuilder = (hmyManagerAbi, erc20Method, erc20Web3Method, hmyManageContractAddress, tokenManageAddress) => {
  const hmyManagerContract = createContract(
    hmyManagerAbi,
    hmyManageContractAddress,
  );

  const hmyMethods = new erc20Method({
    hmy: hmy,
    hmyManagerContract: hmyManagerContract.hmyContract,
    hmyTokenManagerAddress: tokenManageAddress,
  });

  const hmyMethodsWeb3 = new erc20Web3Method({
    web3: hmyWeb3,
    hmyManagerContract: hmyManagerContract.web3Contract,
    hmyManagerContractAddress: hmyManageContractAddress,
    hmyTokenManagerAddress: tokenManageAddress,
  });

  return {
    hmyMethods,
    hmyMethodsWeb3,
  };
};

// ================= 20 =================
const hmyManagerJson = require('../out/HmyManagerERC20');
const erc20Builder = (hmyManageContractAddress, tokenManageAddress) =>
  ercBuilder(hmyManagerJson.abi, HmyMethodsERC20, HmyMethodsERC20Web3, hmyManageContractAddress, tokenManageAddress);

const hmyManagerJsonHrc20 = require('../out/HmyManagerHRC20');
const hrc20Builder = (hmyManageContractAddress) =>
  ercBuilder(hmyManagerJsonHrc20.abi, HmyMethodsHRC20, HmyMethodsHRC20Web3, hmyManageContractAddress, undefined);

export const hmyMethodsERC20 = erc20Builder(process.env.HMY_ERC20_MANAGER_CONTRACT, process.env.TOKEN_MANAGER_CONTRACT);
export const hmyMethodsBEP20 = erc20Builder(process.env.HMY_BRIDGE_MANAGER, process.env.TOKEN_MANAGER_CONTRACT_FOR_BSC);
export const hmyMethodsHRC20 = hrc20Builder(process.env.HMY_HRC20_MANAGER_CONTRACT);
export const hmyMethodsBHRC20 = hrc20Builder(process.env.HMY_BRIDGE_MANAGER);

// ================= 721 =================
const hmyManagerJson721 = require('../out/ERC721HmyManager');
const erc721Builder = (hmyManageContractAddress, tokenManageAddress) =>
  ercBuilder(hmyManagerJson721.abi, HmyMethodsERC20, HmyMethodsERC20Web3, hmyManageContractAddress, tokenManageAddress);

const hmyManagerJsonHrc721 = require('../out/NFTHmyManager');
const hrc721Builder = (hmyManageContractAddress) =>
  ercBuilder(hmyManagerJsonHrc721.abi, HmyMethodsHRC721, HmyMethodsHRC721Web3, hmyManageContractAddress, undefined);

export const hmyMethodsERC721 = erc721Builder(process.env.HMY_ERC721_MANAGER_CONTRACT, process.env.NFT_TOKEN_MANAGER_CONTRACT);
export const hmyMethodsBEP721 = erc721Builder(process.env.HMY_BEP721_MANAGER_CONTRACT, process.env.BEP721_TOKEN_MANAGER_CONTRACT);
export const hmyMethodsPERC721 = erc721Builder(process.env.HMY_PERC721_MANAGER_CONTRACT, process.env.PERC721_TOKEN_MANAGER_CONTRACT);
export const hmyMethodsHRC721 = hrc721Builder(process.env.HMY_HRC721_MANAGER_CONTRACT);
export const hmyMethodsBHRC721 = hrc721Builder(process.env.HMY_BHRC721_MANAGER_CONTRACT);
export const hmyMethodsPHRC721 = hrc721Builder(process.env.HMY_PHRC721_MANAGER_CONTRACT);

// ================= 1155 =================
const hmyManagerJsonErc1155 = require('../out/ERC1155HmyManager');
const erc1155Builder = (hmyManageContractAddress, tokenManageAddress) =>
  ercBuilder(hmyManagerJsonErc1155.abi, HmyMethodsERC1155, HmyMethodsERC1155Web3, hmyManageContractAddress, tokenManageAddress);

const hmyManagerJsonHrc1155 = require('../out/HRC1155HmyManager');
const hrc1155Builder = (hmyManageContractAddress) =>
  ercBuilder(hmyManagerJsonHrc1155.abi, HmyMethodsHRC1155, HmyMethodsHRC1155Web3, hmyManageContractAddress, undefined);

export const hmyMethodsERC1155 = erc1155Builder(process.env.HMY_ERC1155_MANAGER_CONTRACT, process.env.HMY_ERC1155_MANAGER_TOKEN);
export const hmyMethodsBEP1155 = erc1155Builder(process.env.HMY_BEP1155_MANAGER_CONTRACT, process.env.HMY_BEP1155_MANAGER_TOKEN);
export const hmyMethodsPERC1155 = erc1155Builder(process.env.HMY_PERC1155_MANAGER_CONTRACT, process.env.HMY_PERC1155_MANAGER_TOKEN);
export const hmyMethodsHRC1155 = hrc1155Builder(process.env.HMY_HRC1155_MANAGER_CONTRACT);
export const hmyMethodsBHRC1155 = hrc1155Builder(process.env.HMY_BHRC1155_MANAGER_CONTRACT);
export const hmyMethodsPHRC1155 = hrc1155Builder(process.env.HMY_PHRC1155_MANAGER_CONTRACT);

// ================= Deposit =================
const hmyDepositJson = require('../out/Deposit');
const hmyDepositContract = createContract(
  hmyDepositJson.abi,
  process.env.HMY_DEPOSIT_CONTRACT,
);

const hmyMethodsDepositHmy = new HmyMethodsDeposit({
  hmy: hmy,
  hmyManagerContract: hmyDepositContract.hmyContract,
});

const hmyMethodsDepositWeb3 = new HmyMethodsDepositWeb3({
  web3: hmyWeb3,
  hmyManagerContract: hmyDepositContract.web3Contract,
});

export const hmyMethodsDeposit = {
  hmyMethods: hmyMethodsDepositHmy,
  hmyMethodsWeb3: hmyMethodsDepositWeb3,
};


// const hmySubManagerContract = createContract(
//   hmyManagerJson.abi,
//   process.env.HMY_ERC20_SUB_MANAGER_CONTRACT,
// );

// export const hmyMethodsERC20SUBHmy = new HmyMethodsERC20({
//   hmy: hmy,
//   hmyManagerContract: hmySubManagerContract.hmyContract,
// });

// export const hmyMethodsSubERC20Web3 = new HmyMethodsERC20Web3({
//   web3: hmyWeb3,
//   hmyManagerContract: hmySubManagerContract.web3Contract,
//   hmyManagerContractAddress: process.env.HMY_ERC20_SUB_MANAGER_CONTRACT,
// });

// export const hmyMethodsERC20SUB = {
//   hmyMethods: hmyMethodsERC20SUBHmy,
//   hmyMethodsWeb3: hmyMethodsSubERC20Web3,
// };

// const hmySubManagerContractBEP20 = createContract(
//   hmyManagerJson.abi,
//   process.env.HMY_BEP20_SUB_MANAGER_CONTRACT,
// );

// export const hmyMethodsBEP20SUBHmy = new HmyMethodsERC20({
//   hmy: hmy,
//   hmyManagerContract: hmySubManagerContractBEP20.hmyContract,
// });

// export const hmyMethodsSubBEP20Web3 = new HmyMethodsERC20Web3({
//   web3: hmyWeb3,
//   hmyManagerContract: hmySubManagerContractBEP20.web3Contract,
//   hmyManagerContractAddress: process.env.HMY_BEP20_SUB_MANAGER_CONTRACT,
// });

// export const hmyMethodsBEP20SUB = {
//   hmyMethods: hmyMethodsBEP20SUBHmy,
//   hmyMethodsWeb3: hmyMethodsSubBEP20Web3,
// };


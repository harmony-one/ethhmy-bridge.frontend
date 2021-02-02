import Web3 from 'web3';
import { HmyMethods } from './HmyMethods';
import { HmyMethodsDeposit } from './HmyMethodsDeposit';
import { HmyMethodsWeb3 } from './HmyMethodsWeb3';
import { HmyMethodsDepositWeb3 } from './HmyMethodsDepositWeb3';
import { HmyMethodsERC20 } from './HmyMethodsERC20';
import { HmyMethodsHRC20 } from './HmyMethodsHRC20';
import { HmyMethodsERC20Web3 } from './HmyMethodsERC20Web3';
import { HmyMethodsHRC20Web3 } from './HmyMethodsHRC20Web3';
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

const web3URL = window.web3
  ? window.web3.currentProvider
  : process.env.HMY_NODE_URL;

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

const hmyBUSDJson = require('../out/MyERC20.json');
const hmyBUSDManagerJson = require('../out/LINKHmyManager.json');
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

const hmyManagerJson = require('../out/HmyManagerERC20.json');
const hmyManagerJsonHrc20 = require('../out/HmyManagerHRC20.json');
const hmyManagerJson721 = require('../out/ERC721HmyManager.json');

const hmyManagerContract = createContract(
  hmyManagerJson.abi,
  process.env.HMY_ERC20_MANAGER_CONTRACT,
);
const hmyManagerContractHrc20 = createContract(
  hmyManagerJsonHrc20.abi,
  process.env.HMY_HRC20_MANAGER_CONTRACT,
);
const hmyManagerContract721 = createContract(
  hmyManagerJson721.abi,
  process.env.HMY_ERC721_MANAGER_CONTRACT,
);

export const hmyMethodsERC20Hmy = new HmyMethodsERC20({
  hmy: hmy,
  hmyManagerContract: hmyManagerContract.hmyContract,
});

export const hmyMethodsHRC20Hmy = new HmyMethodsHRC20({
  hmy: hmy,
  hmyManagerContract: hmyManagerContractHrc20.hmyContract,
});

export const hmyMethodsERC721Hmy = new HmyMethodsERC20({
  hmy: hmy,
  hmyManagerContract: hmyManagerContract721.hmyContract,
});

export const hmyMethodsERC20Web3 = new HmyMethodsERC20Web3({
  web3: hmyWeb3,
  hmyManagerContract: hmyManagerContract.web3Contract,
  hmyManagerContractAddress: process.env.HMY_ERC20_MANAGER_CONTRACT,
});

export const hmyMethodsHRC20Web3 = new HmyMethodsHRC20Web3({
  web3: hmyWeb3,
  hmyManagerContract: hmyManagerContractHrc20.web3Contract,
  hmyManagerContractAddress: process.env.HMY_HRC20_MANAGER_CONTRACT,
});

export const hmyMethodsERC721Web3 = new HmyMethodsERC20Web3({
  web3: hmyWeb3,
  hmyManagerContract: hmyManagerContract721.web3Contract,
  hmyManagerContractAddress: process.env.HMY_ERC721_MANAGER_CONTRACT,
});

export const hmyMethodsERC20 = {
  hmyMethods: hmyMethodsERC20Hmy,
  hmyMethodsWeb3: hmyMethodsERC20Web3,
};

export const hmyMethodsHRC20 = {
  hmyMethods: hmyMethodsHRC20Hmy,
  hmyMethodsWeb3: hmyMethodsHRC20Web3,
};

export const hmyMethodsERC721 = {
  hmyMethods: hmyMethodsERC721Hmy,
  hmyMethodsWeb3: hmyMethodsERC721Web3,
};

const hmyDepositJson = require('../out/Deposit.json');
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

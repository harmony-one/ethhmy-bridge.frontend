import Web3 from 'web3';
import { HmyMethods } from './HmyMethods';
import { HmyMethodsWeb3 } from './HmyMethodsWeb3';
import { HmyMethodsERC20 } from './HmyMethodsERC20';
import { HmyMethodsHRC20 } from './HmyMethodsHRC20';
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

const hmyBUSDJson = require('../out/MyERC20.json');
const hmyBUSDContract = this.hmy.contracts.createContract(
  hmyBUSDJson.abi,
  process.env.HMY_BUSD_CONTRACT,
);

const hmyBUSDContractWeb3 = new hmyWeb3.eth.Contract(
  hmyBUSDJson.abi,
  process.env.HMY_BUSD_CONTRACT,
);

const hmyBUSDManagerJson = require('../out/LINKHmyManager.json');
let hmyBUSDManagerContract = this.hmy.contracts.createContract(
  hmyBUSDManagerJson.abi,
  process.env.HMY_BUSD_MANAGER_CONTRACT,
);

let hmyBUSDManagerContractWeb3 = new hmyWeb3.eth.Contract(
  hmyBUSDManagerJson.abi,
  process.env.HMY_BUSD_MANAGER_CONTRACT,
);

const hmyLINKJson = require('../out/MyERC20.json');
let hmyLINKContract = hmy.contracts.createContract(
  hmyLINKJson.abi,
  process.env.HMY_LINK_CONTRACT,
);

const hmyLINKManagerJson = require('../out/LINKHmyManager.json');
let hmyLINKManagerContract = hmy.contracts.createContract(
  hmyLINKManagerJson.abi,
  process.env.HMY_LINK_MANAGER_CONTRACT,
);

export const hmyMethodsBUSD = new HmyMethods({
  hmy: hmy,
  hmyTokenContract: hmyBUSDContract,
  hmyManagerContract: hmyBUSDManagerContract,
});

export const hmyMethodsBUSDWeb3 = new HmyMethodsWeb3({
  web3: hmyWeb3,
  hmyTokenContract: hmyBUSDContractWeb3,
  hmyManagerContract: hmyBUSDManagerContractWeb3,
  hmyManagerContractAddress: process.env.HMY_BUSD_MANAGER_CONTRACT,
});

export const hmyMethodsLINK = new HmyMethods({
  hmy: hmy,
  hmyTokenContract: hmyLINKContract,
  hmyManagerContract: hmyLINKManagerContract,
});

const hmyManagerJson = require('../out/HmyManagerERC20.json');
const hmyManagerContract = this.hmy.contracts.createContract(
  hmyManagerJson.abi,
  process.env.HMY_ERC20_MANAGER_CONTRACT,
);

const hmyManagerJsonHrc20 = require('../out/HmyManagerHRC20.json');
const hmyManagerContractHrc20 = this.hmy.contracts.createContract(
  hmyManagerJsonHrc20.abi,
  process.env.HMY_HRC20_MANAGER_CONTRACT,
);

export const hmyMethodsERC20 = new HmyMethodsERC20({
  hmy: hmy,
  hmyManagerContract: hmyManagerContract,
});

export const hmyMethodsHRC20 = new HmyMethodsHRC20({
  hmy: hmy,
  hmyManagerContract: hmyManagerContractHrc20,
});

const hmyManagerJson721 = require('../out/ERC721HmyManager.json');
const hmyManagerContract721 = this.hmy.contracts.createContract(
  hmyManagerJson721.abi,
  process.env.HMY_ERC721_MANAGER_CONTRACT,
);

export const hmyMethodsERC721 = new HmyMethodsERC20({
  hmy: hmy,
  hmyManagerContract: hmyManagerContract721,
});

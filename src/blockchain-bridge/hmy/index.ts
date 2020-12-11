import { HmyMethods } from './HmyMethods';
import { HmyMethodsERC20 } from './HmyMethodsERC20';
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

const hmyBUSDJson = require('../out/MyERC20.json');
const hmyBUSDContract = this.hmy.contracts.createContract(
  hmyBUSDJson.abi,
  process.env.HMY_BUSD_CONTRACT,
);

const hmyBUSDManagerJson = require('../out/LINKHmyManager.json');
let hmyBUSDManagerContract = this.hmy.contracts.createContract(
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

export const hmyMethodsERC20 = new HmyMethodsERC20({
  hmy: hmy,
  hmyManagerContract: hmyManagerContract,
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

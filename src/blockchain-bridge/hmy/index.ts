import { HmyMethods } from './HmyMethods';
const { Harmony } = require('@harmony-js/core');
const { ChainID, ChainType } = require('@harmony-js/utils');

export const hmy = new Harmony(
  // let's assume we deploy smart contract to this end-point URL
  process.env.HMY_NODE_URL,
  {
    chainType: ChainType.Harmony,
    chainId: ChainID.HmyTestnet,
  },
);

const hmyBUSDJson = require('../out/BUSDImplementation.json');
const hmyBUSDContract = this.hmy.contracts.createContract(
  hmyBUSDJson.abi,
  process.env.HMY_BUSD_CONTRACT,
);

const hmyBUSDManagerJson = require('../out/BUSDHmyManager.json');
let hmyBUSDManagerContract = this.hmy.contracts.createContract(
  hmyBUSDManagerJson.abi,
  process.env.HMY_MANAGER_CONTRACT,
);

const hmyLINKJson = require('../out/LinkToken.json');
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

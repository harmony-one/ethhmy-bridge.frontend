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

const hmyManagerJson = require('../out/HmyManager.json');
const hmyManagerContract = this.hmy.contracts.createContract(
  hmyManagerJson.abi,
  process.env.HMY_MANAGER_CONTRACT,
);

export const hmyMethods = new HmyMethods({
  hmy: hmy,
  hmyManagerContract: hmyManagerContract,
});

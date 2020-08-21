const Web3 = require('web3');
const BN = require('bn.js');

// @ts-ignore
const web3URL = window.web3 ? window.web3.currentProvider : process.env.ETH_NODE_URL;

export const web3 = new Web3(web3URL);

const ethBUSDJson = require('./out/BUSDImplementation.json');
export const ethBUSDContract = new web3.eth.Contract(
  ethBUSDJson.abi,
  process.env.ETH_BUSD_CONTRACT,
);

const EthManagerJson = require('./out/BUSDEthManager.json');
export const managerContract = new web3.eth.Contract(
  EthManagerJson.abi,
  process.env.ETH_MANAGER_CONTRACT,
);

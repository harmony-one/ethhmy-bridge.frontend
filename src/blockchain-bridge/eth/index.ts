import { EthMethods } from './EthMethods';

const Web3 = require('web3');

const web3URL = window.web3
  ? window.web3.currentProvider
  : process.env.ETH_NODE_URL;

export const web3 = new Web3(web3URL);

const ethBUSDJson = require('../out/BUSDImplementation.json');
const ethBUSDContract = new web3.eth.Contract(
  ethBUSDJson.abi,
  process.env.ETH_BUSD_CONTRACT,
);

const ethBUSDManagerJson = require('../out/BUSDEthManager.json');
const ethBUSDManagerContract = new web3.eth.Contract(
  ethBUSDManagerJson.abi,
  process.env.ETH_MANAGER_CONTRACT,
);

const ethLINKJson = require('../out/LinkToken.json');
const ethLINKContract = new web3.eth.Contract(
  ethLINKJson.abi,
  process.env.ETH_LINK_CONTRACT,
);

const ethLINKManagerJson = require('../out/LINKEthManager.json');
const ethLINKManagerContract = new web3.eth.Contract(
  ethLINKManagerJson.abi,
  process.env.ETH_LINK_MANAGER_CONTRACT,
);

export const ethMethodsBUSD = new EthMethods({
  web3: web3,
  ethTokenContract: ethBUSDContract,
  ethManagerContract: ethBUSDManagerContract,
  ethManagerAddress: process.env.ETH_MANAGER_CONTRACT,
});

export const ethMethodsLINK = new EthMethods({
  web3: web3,
  ethTokenContract: ethLINKContract,
  ethManagerContract: ethLINKManagerContract,
  ethManagerAddress: process.env.ETH_LINK_MANAGER_CONTRACT,
});

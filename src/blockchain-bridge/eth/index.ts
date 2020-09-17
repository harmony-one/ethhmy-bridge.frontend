import { EthMethods } from './EthMethods';

const Web3 = require('web3');

const web3URL = window.web3
  ? window.web3.currentProvider
  : process.env.ETH_NODE_URL;

export const web3 = new Web3(web3URL);

const ethManagerJson = require('../out/EthManager.json');
const ethManagerContract = new web3.eth.Contract(
  ethManagerJson.abi,
  process.env.ETH_MANAGER_CONTRACT,
);

export const ethMethods = new EthMethods({
  web3: web3,
  ethManagerContract: ethManagerContract,
  ethManagerAddress: process.env.ETH_MANAGER_CONTRACT,
});

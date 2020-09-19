import { EthMethods } from './EthMethods';
import { EthMethodsERC20 } from './EthMethodsERC20';

const Web3 = require('web3');

const web3URL = window.web3
  ? window.web3.currentProvider
  : process.env.ETH_NODE_URL;

export const web3 = new Web3(web3URL);

const ethBUSDJson = require('../out/MyERC20.json');
const ethBUSDContract = new web3.eth.Contract(
  ethBUSDJson.abi,
  process.env.ETH_BUSD_CONTRACT,
);

const ethBUSDManagerJson = require('../out/LINKEthManager.json');
const ethBUSDManagerContract = new web3.eth.Contract(
  ethBUSDManagerJson.abi,
  process.env.ETH_BUSD_MANAGER_CONTRACT,
);

const ethLINKJson = require('../out/MyERC20.json');
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
  ethManagerAddress: process.env.ETH_BUSD_MANAGER_CONTRACT,
});

export const ethMethodsLINK = new EthMethods({
  web3: web3,
  ethTokenContract: ethLINKContract,
  ethManagerContract: ethLINKManagerContract,
  ethManagerAddress: process.env.ETH_LINK_MANAGER_CONTRACT,
});

const ethManagerJson = require('../out/EthManagerERC20.json');
const ethManagerContract = new web3.eth.Contract(
  ethManagerJson.abi,
  process.env.ETH_ERC20_MANAGER_CONTRACT,
);

export const ethMethodsERC20 = new EthMethodsERC20({
  web3: web3,
  ethManagerContract: ethManagerContract,
  ethManagerAddress: process.env.ETH_ERC20_MANAGER_CONTRACT,
});

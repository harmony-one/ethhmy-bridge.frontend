import { EthMethods } from './EthMethods';
import { EthMethodsERC20 } from './EthMethodsERC20';
import { EthMethodsHRC20 } from './EthMethodsHRC20';

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

const ethManagerJsonHrc20 = require('../out/EthManagerHRC20.json');
const ethManagerContractHrc20 = new web3.eth.Contract(
  ethManagerJsonHrc20.abi,
  process.env.ETH_HRC20_MANAGER_CONTRACT,
);

const ethManagerERC721Json = require('../out/ERC721EthManager.json');
const ethManagerContractERC721 = new web3.eth.Contract(
  ethManagerERC721Json.abi,
  process.env.ETH_ERC721_MANAGER_CONTRACT,
);

export const ethMethodsERC20 = new EthMethodsERC20({
  web3: web3,
  ethManagerContract: ethManagerContract,
  ethManagerAddress: process.env.ETH_ERC20_MANAGER_CONTRACT,
});

export const ethMethodsHRC20 = new EthMethodsHRC20({
  web3: web3,
  ethManagerContract: ethManagerContractHrc20,
  ethManagerAddress: process.env.ETH_HRC20_MANAGER_CONTRACT,
});

export const ethMethodsERС721 = new EthMethodsERC20({
  web3: web3,
  ethManagerContract: ethManagerContractERC721,
  ethManagerAddress: process.env.ETH_ERC721_MANAGER_CONTRACT,
});

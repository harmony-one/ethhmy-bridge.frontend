import { EthMethods } from './EthMethods';
import { EthMethodsERC20 } from './EthMethodsERC20';
import { EthMethodsHRC20 } from './EthMethodsHRC20';
import { NETWORK_TYPE, TConfig, TFullConfig } from '../../stores/interfaces';
import stores from '../../stores';
import { getNetworkFee } from './helpers';
import Web3 from 'web3';
import { EthMethodsHRC721 } from './EthMethodsHRC721';
import { EthMethodsHRC1155 } from './EthMethodsHRC1155';
import { EthMethodsERC1155 } from './EthMethodsERC1155';

// @ts-ignore
const web3URL = window.ethereum ? window.ethereum : process.env.ETH_NODE_URL;

export interface INetworkMethods {
  web3: Web3;
  ethMethodsBUSD: EthMethods;
  ethMethodsLINK: EthMethods;
  ethMethodsERC20: EthMethodsERC20;
  ethMethodsHRC20: EthMethodsHRC20;
  ethMethodsERС721: EthMethodsERC20;
  ethMethodsHRC721: EthMethodsHRC721;
  ethMethodsERC1155: EthMethodsERC1155;
  ethMethodsHRC1155: EthMethodsHRC1155;
  getNetworkFee: () => Promise<number>;
  getEthBalance: (address: string) => Promise<string>;
}

const init = (config: TConfig): INetworkMethods => {
  const web3 = new Web3(web3URL);

  const ethBUSDJson = require('../out/MyERC20');
  const ethBUSDContract = new web3.eth.Contract(
    ethBUSDJson.abi,
    config.contracts.busd,
  );

  const ethBUSDManagerJson = require('../out/LINKEthManager');
  const ethBUSDManagerContract = new web3.eth.Contract(
    ethBUSDManagerJson.abi,
    config.contracts.busdManager,
  );

  const ethLINKJson = require('../out/MyERC20');
  const ethLINKContract = new web3.eth.Contract(
    ethLINKJson.abi,
    config.contracts.link,
  );

  const ethLINKManagerJson = require('../out/LINKEthManager');
  const ethLINKManagerContract = new web3.eth.Contract(
    ethLINKManagerJson.abi,
    config.contracts.linkManager,
  );

  const ethMethodsBUSD = new EthMethods({
    web3: web3,
    ethTokenContract: ethBUSDContract,
    ethManagerContract: ethBUSDManagerContract,
    ethManagerAddress: config.contracts.busdManager,
  });

  const ethMethodsLINK = new EthMethods({
    web3: web3,
    ethTokenContract: ethLINKContract,
    ethManagerContract: ethLINKManagerContract,
    ethManagerAddress: config.contracts.linkManager,
  });

  const ethManagerJson = require('../out/EthManagerERC20');
  const ethManagerContract = new web3.eth.Contract(
    ethManagerJson.abi,
    config.contracts.erc20Manager,
  );

  const ethManagerJsonHrc20 = require('../out/EthManagerHRC20');
  const ethManagerContractHrc20 = new web3.eth.Contract(
    ethManagerJsonHrc20.abi,
    config.contracts.hrc20Manager,
  );

  const ethManagerERC721Json = require('../out/ERC721EthManager');
  const ethManagerContractERC721 = new web3.eth.Contract(
    ethManagerERC721Json.abi,
    config.contracts.erc721Manager,
  );

  const ethManagerHRC721Json = require('../out/NFTEthManager');
  const ethManagerContractHRC721 = new web3.eth.Contract(
    ethManagerHRC721Json.abi,
    config.contracts.hrc721Manager,
  );

  const ethManagerHRC1155Json = require('../out/HRC1155EthManager');
  const ethManagerContractHRC1155 = new web3.eth.Contract(
    ethManagerHRC1155Json.abi,
    config.contracts.hrc1155Manager,
  );

  const ethManagerERC1155Json = require('../out/ERC1155EthManager');
  const ethManagerContractERC1155 = new web3.eth.Contract(
    ethManagerERC1155Json.abi,
    config.contracts.erc1155Manager,
  );

  const ethMethodsERC20 = new EthMethodsERC20({
    web3: web3,
    ethManagerContract: ethManagerContract,
    ethManagerAddress: config.contracts.erc20Manager,
    gasPrice: config.gasPrice
  });

  const ethMethodsHRC20 = new EthMethodsHRC20({
    web3: web3,
    ethManagerContract: ethManagerContractHrc20,
    ethManagerAddress: config.contracts.hrc20Manager,
    ethTokenManagerAddress: config.contracts.tokenManager,
    gasPrice: config.gasPrice
  });

  const ethMethodsERС721 = new EthMethodsERC20({
    web3: web3,
    ethManagerContract: ethManagerContractERC721,
    ethManagerAddress: config.contracts.erc721Manager,
  });

  const ethMethodsHRC721 = new EthMethodsHRC721({
    web3: web3,
    ethManagerContract: ethManagerContractHRC721,
    ethManagerAddress: config.contracts.hrc721Manager,
    ethTokenManagerAddress: config.contracts.hrc721TokenManager,
    gasPrice: config.gasPrice
  });

  const ethMethodsERC1155 = new EthMethodsERC1155({
    web3: web3,
    ethManagerContract: ethManagerContractERC1155,
    ethManagerAddress: config.contracts.erc1155Manager,
  });

  const ethMethodsHRC1155 = new EthMethodsHRC1155({
    web3: web3,
    ethManagerContract: ethManagerContractHRC1155,
    ethManagerAddress: config.contracts.hrc1155Manager,
    ethTokenManagerAddress: config.contracts.hrc1155TokenManager,
    gasPrice: config.gasPrice
  });

  return {
    web3,
    ethMethodsBUSD,
    ethMethodsLINK,
    ethMethodsERC20,
    ethMethodsHRC20,
    ethMethodsERС721,
    ethMethodsHRC721,
    ethMethodsERC1155,
    ethMethodsHRC1155,
    getNetworkFee: () => getNetworkFee(web3),
    getEthBalance: (ethAddress): Promise<string> => {
      return new Promise((resolve, reject) => {
        web3.eth.getBalance(ethAddress, (err, balance) => {
          if (err) {
            reject(err);
          }
          // const rez = String(new BN(balance).div(new BN(1e18)));

          resolve(String(Number(balance) / 1e18));
        });
      });
    },
  };
};

let ethNetwork: INetworkMethods, binanceNetwork: INetworkMethods, harmonyShard1Network: INetworkMethods;

export const initNetworks = (fullCinfig: TFullConfig) => {
  ethNetwork = init(fullCinfig.ethClient);
  binanceNetwork = init(fullCinfig.binanceClient);
  harmonyShard1Network = init(fullCinfig.harmonyShard1Client);
};

export const getExNetworkMethods = (): INetworkMethods => {
  switch (stores.exchange.network) {
    case NETWORK_TYPE.ETHEREUM:
      return ethNetwork;
    case NETWORK_TYPE.BINANCE:
      return binanceNetwork;
    case NETWORK_TYPE.HARMONYSHARD1:
      return harmonyShard1Network;
  }
};

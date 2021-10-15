import { mulDecimals } from '../../utils';
import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';
import { getAddress } from '@harmony-js/crypto';
import { getGasPrice } from '../eth/helpers';

const BN = require('bn.js');

interface IHmyMethodsInitParams {
  web3: Web3;
  hmyManagerContract: Contract;
  hmyManagerContractAddress: string;
  options?: { gasPrice: number; gasLimit: number };
}

export class HmyMethodsHRC1155Web3 {
  private web3: Web3;
  private hmyManagerContract: Contract;
  private hmyManagerContractAddress: string;

  // private options = { gasPrice: 1000000000, gasLimit: 6721900 };

  constructor(params: IHmyMethodsInitParams) {
    this.web3 = params.web3;
    this.hmyManagerContract = params.hmyManagerContract;
    this.hmyManagerContractAddress = params.hmyManagerContractAddress;

    // if (params.options) {
    //   this.options = params.options;
    // }
  }

  approveHmyManger = async (
    hrc1155Address,
    sendTxCallback?,
  ) => {
    const tokenJson = require('../out/MyERC1155');
    const hmyTokenContract = new this.web3.eth.Contract(
      tokenJson.abi,
      hrc1155Address,
    );

    // @ts-ignore
    const accounts = await ethereum.enable();

    let res = await hmyTokenContract.methods
      .isApprovedForAll(accounts[0], this.hmyManagerContractAddress)
      .call();

    if (!res) {
      await hmyTokenContract.methods
        .setApprovalForAll(this.hmyManagerContractAddress, true)
        .send({
          from: accounts[0],
          gas: process.env.ETH_GAS_LIMIT,
          gasPrice: await getGasPrice(this.web3),
        })
        .on('transactionHash', hash => sendTxCallback(hash));
    } else {
      sendTxCallback('skip');
    }

    return res;
  };

  /////////////////////////////////////////
  /////////////////////////////////////////
  /////////////////////////////////////////
  /////////////////////////////////////////
  /////////////////////////////////////////

  lockTokens = async (
    erc1155Address,
    userAddr,
    tokenIds,
    amounts,
    sendTxCallback?,
  ) => {
    // @ts-ignore
    const accounts = await ethereum.enable();
    const hmyAddrHex = getAddress(userAddr).checksum;

    const res = await this.hmyManagerContract.methods
      .lockHRC1155Tokens(erc1155Address, tokenIds, hmyAddrHex, amounts, [])
      .send({
        from: accounts[0],
        gasLimit: process.env.GAS_LIMIT,
        gasPrice: new BN(await this.web3.eth.getGasPrice()).mul(new BN(1)),
      })
      .on('transactionHash', sendTxCallback);

    return res;
  };

  tokenDetails = async erc1155Address => {
    const tokenJson = require('../out/MyERC1155');
    const erc1155Contract = new this.web3.eth.Contract(
      tokenJson.abi,
      erc1155Address,
    );

    let tryOrDefault = async <T>(p: Promise<T>, d: T) => {
      try {
        return await p;
      } catch (e) {
        return d;
      }
    };

    const name = await tryOrDefault(erc1155Contract.methods.name().call(), '');
    const symbol = await tryOrDefault(erc1155Contract.methods.symbol().call(), '');
    const baseURI = await erc1155Contract.methods.uri(0).call();

    return {
      name,
      symbol,
      baseURI,
      erc1155Address,
    };
  };

  allowance = async (addr: string, erc1155Address: string) => {
    const addrHex = getAddress(addr).checksum;

    const tokenJson = require('../out/MyERC1155');
    const hmyTokenContract = new this.web3.eth.Contract(
      tokenJson.abi,
      erc1155Address,
    );

    return await hmyTokenContract.methods
      .allowance(addrHex, this.hmyManagerContractAddress)
      .call();
  };
}

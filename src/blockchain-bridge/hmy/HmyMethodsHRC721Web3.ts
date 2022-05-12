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

export class HmyMethodsHRC721Web3 {
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

  approveHmyManger = async (hrc721Address, sendTxCallback?) => {
    const tokenJson = require('../out/MyERC721');
    const hmyTokenContract = new this.web3.eth.Contract(
      tokenJson.abi,
      hrc721Address,
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

  lockTokens = async (erc721Address, userAddr, tokenIds, sendTxCallback?) => {
    // @ts-ignore
    const accounts = await ethereum.enable();
    const hmyAddrHex = getAddress(userAddr).checksum;

    const res = await this.hmyManagerContract.methods
      .lockTokens(erc721Address, tokenIds, hmyAddrHex)
      .send({
        from: accounts[0],
        gasLimit: process.env.GAS_LIMIT,
        gasPrice: new BN(await this.web3.eth.getGasPrice()).mul(new BN(1)),
      })
      .on('transactionHash', sendTxCallback);

    return res;
  };

  tokenDetails = async erc721Address => {
    const tokenJson = require('../out/MyERC721');
    const erc721Contract = new this.web3.eth.Contract(
      tokenJson.abi,
      erc721Address,
    );

    const name = await erc721Contract.methods.name().call();
    const symbol = await erc721Contract.methods.symbol().call();
    const baseURI = await erc721Contract.methods.baseURI().call();

    return {
      name,
      symbol,
      baseURI,
      erc721Address,
    };
  };

  balanceOf = async (erc721Address: string) => {
    const tokenJson = require('../out/MyERC721');
    // @ts-ignore
    const accounts = await ethereum.enable();
    const erc721Contract = new this.web3.eth.Contract(
      tokenJson.abi,
      erc721Address,
    );

    return await erc721Contract.methods.balanceOf(accounts[0]).call();
  };

  checkHmyBalance = async (erc721Address: string, addr: string) => {
    const tokenJson = require('../out/MyERC721');
    const hmyTokenContract = new this.web3.eth.Contract(
      tokenJson.abi,
      erc721Address,
    );

    const addrHex = getAddress(addr).checksum;

    return await hmyTokenContract.methods.balanceOf(addrHex).call();
  };

  allowance = async (addr: string, erc721Address: string) => {
    const addrHex = getAddress(addr).checksum;

    const tokenJson = require('../out/MyERC721');
    const hmyTokenContract = new this.web3.eth.Contract(
      tokenJson.abi,
      erc721Address,
    );

    return await hmyTokenContract.methods
      .allowance(addrHex, this.hmyManagerContractAddress)
      .call();
  };
}

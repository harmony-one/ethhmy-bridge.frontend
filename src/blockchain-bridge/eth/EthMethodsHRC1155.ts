import { Contract } from 'web3-eth-contract';
import { getAddress } from '@harmony-js/crypto';
import Web3 from 'web3';
import { mulDecimals } from '../../utils';
import { getGasPrice } from './helpers';

const BN = require('bn.js');

export interface IEthMethodsInitParams {
  web3: Web3;
  ethManagerContract: Contract;
  ethManagerAddress: string;
  ethTokenManagerAddress: string;
  gasPrice: number;
}

export class EthMethodsHRC1155 {
  private web3: Web3;
  private ethManagerContract: Contract;
  private ethManagerAddress: string;
  private ethTokenManagerAddress: string;
  gasPrice?: number;

  constructor(params: IEthMethodsInitParams) {
    this.web3 = params.web3;
    this.ethManagerContract = params.ethManagerContract;
    this.ethManagerAddress = params.ethManagerAddress;
    this.ethTokenManagerAddress = params.ethTokenManagerAddress;
    this.gasPrice = params.gasPrice;
  }

  approveEthManger = async (
    erc1155Address,
    sendTxCallback?,
  ) => {
    // @ts-ignore
    const accounts = await ethereum.enable();
    const MyERC1155Json = require('../out/MyERC1155');
    const erc1155Contract = new this.web3.eth.Contract(
      MyERC1155Json.abi,
      erc1155Address,
    );

    let res;
    res = await erc1155Contract.methods
      .isApprovedForAll(accounts[0], this.ethManagerAddress)
      .call();

    if (!res) {
      await erc1155Contract.methods
        .setApprovalForAll(this.ethManagerAddress, true)
        .send({
          from: accounts[0],
          gas: process.env.ETH_GAS_LIMIT,
          gasPrice: await getGasPrice(this.web3),
        })
        .on('transactionHash', hash => sendTxCallback(hash));

    } else {
      sendTxCallback('skip');
    }
  };

  burnToken = async (
    hrc721Address,
    userAddr,
    tokenIds,
    amounts,
    sendTxCallback?,
  ) => {
    // @ts-ignore
    const accounts = await ethereum.enable();
    const hmyAddrHex = getAddress(userAddr).checksum;
    const hrc721AddressHex = getAddress(hrc721Address).checksum;

    let estimateGas = 0;
    try {
      estimateGas = await this.ethManagerContract.methods
        .burnTokens(hrc721AddressHex, tokenIds, hmyAddrHex, amounts)
        .estimateGas({ from: accounts[0] });
    } catch (e) {
      console.log(e);
    }

    const gasLimit = Math.max(
      estimateGas + estimateGas * 0.3,
      Number(process.env.ETH_GAS_LIMIT),
    );
    let transaction = await this.ethManagerContract.methods
      .burnTokens(hrc721AddressHex, tokenIds, hmyAddrHex, amounts)
      .send({
        from: accounts[0],
        gas: new BN(gasLimit),
        gasPrice: this.gasPrice ? this.gasPrice : await getGasPrice(this.web3),
      })
      .on('transactionHash', hash => sendTxCallback(hash));

    return transaction.events.Locked;
  };

  checkEthBalance = async (erc1155Address, addr) => {
    const MyERC1155Json = require('../out/MyERC1155');
    const erc1155Contract = new this.web3.eth.Contract(
      MyERC1155Json.abi,
      erc1155Address,
    );

    return await erc1155Contract.methods.balanceOf(addr).call();
  };

  tokenDetails = async erc1155Address => {
    if (!this.web3.utils.isAddress(erc1155Address)) {
      throw new Error('Invalid token address');
    }

    const MyERC1155Json = require('../out/MyERC1155');
    const erc1155Contract = new this.web3.eth.Contract(
      MyERC1155Json.abi,
      erc1155Address,
    );

    const name = await erc1155Contract.methods.name().call();
    const symbol = await erc1155Contract.methods.symbol().call();
    const decimals = await erc1155Contract.methods.decimals().call();

    return { name, symbol, decimals, erc1155Address };
  };

  getMappingFor = async (erc1155TokenAddr, withoutFormat = false) => {
    const hmyAddrHex = withoutFormat
      ? erc1155TokenAddr
      : getAddress(erc1155TokenAddr).checksum;

    if (!this.web3.utils.isAddress(hmyAddrHex)) {
      throw new Error('Invalid token address');
    }

    const TokenManagerJson = require('../out/NFTTokenManager');

    const tokenManager = new this.web3.eth.Contract(
      TokenManagerJson.abi,
      this.ethTokenManagerAddress,
    );

    const ress = await tokenManager.methods.mappedTokens(hmyAddrHex).call();

    return ress;
  };

  balanceOf =  async (erc1155Address: string, tokenId: string) => {
    const tokenJson = require('../out/MyERC1155');
    // @ts-ignore
    const accounts = await ethereum.enable();
    const erc1155Contract = new this.web3.eth.Contract(
      tokenJson.abi,
      erc1155Address,
    );

    return await erc1155Contract.methods.balanceOf(accounts[0], tokenId).call();
  };


  totalSupply = async hrc721Address => {
    const MyERC1155Json = require('../out/MyERC1155');
    const erc1155Contract = new this.web3.eth.Contract(
      MyERC1155Json.abi,
      hrc721Address,
    );

    return await erc1155Contract.methods.totalSupply().call();
  };

  allowance = async (addr: string, erc1155Address: string) => {
    if (!this.web3.utils.isAddress(erc1155Address)) {
      throw new Error('Invalid token address');
    }

    const MyERC1155Json = require('../out/MyERC1155');

    const erc1155Contract = new this.web3.eth.Contract(
      MyERC1155Json.abi,
      erc1155Address,
    );

    return await erc1155Contract.methods
      .allowance(addr, this.ethManagerAddress)
      .call();
  };
}

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

export class EthMethodsHRC721 {
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
    erc721Address,
    sendTxCallback?,
  ) => {
    // @ts-ignore
    const accounts = await ethereum.enable();
    const MyERC721Json = require('../out/MyERC721');
    const erc721Contract = new this.web3.eth.Contract(
      MyERC721Json.abi,
      erc721Address,
    );

    let res;
    res = await erc721Contract.methods
      .isApprovedForAll(accounts[0], this.ethManagerAddress)
      .call();

    if (!res) {
      await erc721Contract.methods
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
    amount,
    sendTxCallback?,
  ) => {
    // @ts-ignore
    const accounts = await ethereum.enable();
    const hmyAddrHex = getAddress(userAddr).checksum;
    const hrc721AddressHex = getAddress(hrc721Address).checksum;

    let estimateGas = await this.ethManagerContract.methods
      .burnTokens(hrc721AddressHex, amount, hmyAddrHex)
      .estimateGas({ from: accounts[0] });

    const gasLimit = Math.max(
      estimateGas + estimateGas * 0.3,
      Number(process.env.ETH_GAS_LIMIT),
    );
    let transaction = await this.ethManagerContract.methods
      .burnTokens(hrc721AddressHex, amount, hmyAddrHex)
      .send({
        from: accounts[0],
        gas: new BN(gasLimit),
        gasPrice: this.gasPrice ? this.gasPrice : await getGasPrice(this.web3),
      })
      .on('transactionHash', hash => sendTxCallback(hash));

    return transaction.events.Locked;
  };

  checkEthBalance = async (erc721Address, addr) => {
    const MyERC721Json = require('../out/MyERC721');
    const erc721Contract = new this.web3.eth.Contract(
      MyERC721Json.abi,
      erc721Address,
    );

    return await erc721Contract.methods.balanceOf(addr).call();
  };

  tokenDetails = async erc721Address => {
    if (!this.web3.utils.isAddress(erc721Address)) {
      throw new Error('Invalid token address');
    }

    const MyERC721Json = require('../out/MyERC721');
    const erc721Contract = new this.web3.eth.Contract(
      MyERC721Json.abi,
      erc721Address,
    );

    const name = await erc721Contract.methods.name().call();
    const symbol = await erc721Contract.methods.symbol().call();
    const decimals = await erc721Contract.methods.decimals().call();

    return { name, symbol, decimals, erc721Address };
  };

  getMappingFor = async (erc721TokenAddr, withoutFormat = false) => {
    const hmyAddrHex = withoutFormat
      ? erc721TokenAddr
      : getAddress(erc721TokenAddr).checksum;

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

  totalSupply = async hrc721Address => {
    const MyERC721Json = require('../out/MyERC721');
    const erc721Contract = new this.web3.eth.Contract(
      MyERC721Json.abi,
      hrc721Address,
    );

    return await erc721Contract.methods.totalSupply().call();
  };

  allowance = async (addr: string, erc721Address: string) => {
    if (!this.web3.utils.isAddress(erc721Address)) {
      throw new Error('Invalid token address');
    }

    const MyERC721Json = require('../out/MyERC721');

    const erc721Contract = new this.web3.eth.Contract(
      MyERC721Json.abi,
      erc721Address,
    );

    return await erc721Contract.methods
      .allowance(addr, this.ethManagerAddress)
      .call();
  };
}

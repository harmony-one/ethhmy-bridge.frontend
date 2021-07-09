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

export class EthMethodsHRC20 {
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
    erc20Address,
    amount,
    decimals,
    sendTxCallback?,
  ) => {
    // @ts-ignore
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

    if (Number(amount) === 0) {
      sendTxCallback('skip');
      return;
    }

    const MyERC20Json = require('../out/MyERC20.json');
    const erc20Contract = new this.web3.eth.Contract(
      MyERC20Json.abi,
      erc20Address,
    );

    await erc20Contract.methods
      .approve(this.ethManagerAddress, mulDecimals(amount, decimals))
      .send({
        from: accounts[0],
        gas: process.env.ETH_GAS_LIMIT,
        gasPrice: this.gasPrice ? this.gasPrice : await getGasPrice(this.web3),
      })
      .on('transactionHash', hash => sendTxCallback(hash));
  };

  burnToken = async (
    hrc20Address,
    userAddr,
    amount,
    decimals,
    sendTxCallback?,
  ) => {
    // @ts-ignore
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

    const hmyAddrHex = getAddress(userAddr).checksum;
    const hrc20AddressHex = getAddress(hrc20Address).checksum;

    const estimateGas = await this.ethManagerContract.methods
      .burnToken(hrc20AddressHex, mulDecimals(amount, decimals), hmyAddrHex)
      .estimateGas({ from: accounts[0] });

    const gasLimit = Math.max(
      estimateGas + estimateGas * 0.3,
      Number(process.env.ETH_GAS_LIMIT),
    );

    let transaction = await this.ethManagerContract.methods
      .burnToken(hrc20AddressHex, mulDecimals(amount, decimals), hmyAddrHex)
      .send({
        from: accounts[0],
        gas: new BN(gasLimit),
        gasPrice: this.gasPrice ? this.gasPrice : await getGasPrice(this.web3),
      })
      .on('transactionHash', hash => sendTxCallback(hash));

    return transaction.events.Locked;
  };

  checkEthBalance = async (erc20Address, addr) => {
    const MyERC20Json = require('../out/MyERC20.json');
    const erc20Contract = new this.web3.eth.Contract(
      MyERC20Json.abi,
      erc20Address,
    );

    return await erc20Contract.methods.balanceOf(addr).call();
  };

  tokenDetails = async erc20Address => {
    if (!this.web3.utils.isAddress(erc20Address)) {
      throw new Error('Invalid token address');
    }

    const MyERC20Json = require('../out/MyERC20.json');
    const erc20Contract = new this.web3.eth.Contract(
      MyERC20Json.abi,
      erc20Address,
    );

    const name = await erc20Contract.methods.name().call();
    const symbol = await erc20Contract.methods.symbol().call();
    const decimals = await erc20Contract.methods.decimals().call();

    return { name, symbol, decimals, erc20Address };
  };

  getMappingFor = async (erc20TokenAddr, withoutFormat = false) => {
    const hmyAddrHex = withoutFormat
      ? erc20TokenAddr
      : getAddress(erc20TokenAddr).checksum;

    if (!this.web3.utils.isAddress(hmyAddrHex)) {
      throw new Error('Invalid token address');
    }

    const TokenManagerJson = require('../out/TokenManager.json');

    const tokenManager = new this.web3.eth.Contract(
      TokenManagerJson.abi,
      this.ethTokenManagerAddress,
    );

    const ress = await tokenManager.methods.mappedTokens(hmyAddrHex).call();

    return ress;

    const res = await this.ethManagerContract.methods
      .mappings(hmyAddrHex)
      .call();

    return res;
  };

  totalSupply = async hrc20Address => {
    const MyERC20Json = require('../out/MyERC20.json');
    const erc20Contract = new this.web3.eth.Contract(
      MyERC20Json.abi,
      hrc20Address,
    );

    return await erc20Contract.methods.totalSupply().call();
  };

  allowance = async (addr: string, erc20Address: string) => {
    if (!this.web3.utils.isAddress(erc20Address)) {
      throw new Error('Invalid token address');
    }

    const MyERC20Json = require('../out/MyERC20.json');

    const erc20Contract = new this.web3.eth.Contract(
      MyERC20Json.abi,
      erc20Address,
    );

    return await erc20Contract.methods
      .allowance(addr, this.ethManagerAddress)
      .call();
  };
}

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
}

export class EthMethodsERC20 {
  private web3: Web3;
  private ethManagerContract: Contract;
  private ethManagerAddress: string;

  constructor(params: IEthMethodsInitParams) {
    this.web3 = params.web3;
    this.ethManagerContract = params.ethManagerContract;
    this.ethManagerAddress = params.ethManagerAddress;
  }

  approveEthManger = async (
    erc20Address,
    amount,
    decimals,
    sendTxCallback?,
  ) => {
    // @ts-ignore
    const accounts = await ethereum.enable();

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
        gasPrice: await getGasPrice(this.web3),
      })
      .on('transactionHash', hash => sendTxCallback(hash));
  };

  lockToken = async (
    erc20Address,
    userAddr,
    amount,
    decimals,
    sendTxCallback?,
  ) => {
    // @ts-ignore
    const accounts = await ethereum.enable();

    const secretAddrHex = this.web3.utils.fromAscii(userAddr);
    // TODO: add validation

    const estimateGas = await this.ethManagerContract.methods
      .swapToken(secretAddrHex, mulDecimals(amount, decimals), erc20Address)
      .estimateGas({ from: accounts[0] });

    const gasLimit = Math.max(
      estimateGas + estimateGas * 0.3,
      Number(process.env.ETH_GAS_LIMIT),
    );

    let transaction = await this.ethManagerContract.methods
      .swapToken(secretAddrHex, mulDecimals(amount, decimals), erc20Address)
      .send({
        from: accounts[0],
        gas: new BN(gasLimit),
        gasPrice: await getGasPrice(this.web3),
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
    // todo: check if all the erc20s we care about have the decimals method (it's not required by the standard)
    const decimals = await erc20Contract.methods.decimals().call();

    return { name, symbol, decimals, erc20Address };
  };
}

import { Contract } from 'web3-eth-contract';
import Web3 from 'web3';
import { mulDecimals } from '../../utils';
import { getGasPrice } from './helpers';

const BN = require('bn.js');
const MAX_UINT = Web3.utils
  .toBN(2)
  .pow(Web3.utils.toBN(256))
  .sub(Web3.utils.toBN(1));

export interface IEthMethodsInitParams {
  web3: Web3;
  ethManagerContract: Contract;
  ethManagerAddress: string;
}

export class EthMethodsERC20 {
  private readonly web3: Web3;
  private ethManagerContract: Contract;
  private ethManagerAddress: string;

  constructor(params: IEthMethodsInitParams) {
    this.web3 = params.web3;
    this.ethManagerContract = params.ethManagerContract;
    this.ethManagerAddress = params.ethManagerAddress;
  }

  sendHandler = async (method: any, args: Object, callback: Function) => {
    method.send(args).on('transactionHash', function (hash) {
      callback({ hash })
    }).then(function (receipt) {
      callback({ receipt })
    }).catch(function (error) {
      callback({ error })
    })
  }

  getAllowance = async erc20Address => {
    // @ts-ignore
    const accounts = await ethereum.enable();

    const MyERC20Json = require('../out/MyERC20.json');
    const erc20Contract = new this.web3.eth.Contract(MyERC20Json.abi, erc20Address);

    return await erc20Contract.methods.allowance(accounts[0], this.ethManagerAddress).call();
  };

  callApprove = async (erc20Address, amount, decimals, callback) => {
    // @ts-ignore
    const accounts = await ethereum.enable();

    const MyERC20Json = require('../out/MyERC20.json');
    const erc20Contract = new this.web3.eth.Contract(MyERC20Json.abi, erc20Address);

    amount = Number(mulDecimals(amount, decimals));

    const allowance = await this.getAllowance(erc20Address);

    if (Number(allowance) < Number(amount)) {
      this.sendHandler(erc20Contract.methods.approve(this.ethManagerAddress, MAX_UINT), {
        from: accounts[0],
        gas: process.env.ETH_GAS_LIMIT,
        gasPrice: await getGasPrice(this.web3),
        amount: amount,
      }, callback)
    }
  };

  swapToken = async (erc20Address, userAddr, amount, decimals, callback) => {
    // @ts-ignore
    const accounts = await ethereum.enable();

    const secretAddrHex = this.web3.utils.fromAscii(userAddr);
    // TODO: add validation

    const estimateGas = await this.ethManagerContract.methods
      .swapToken(secretAddrHex, mulDecimals(amount, decimals), erc20Address)
      .estimateGas({ from: accounts[0] });

    const gasLimit = Math.max(estimateGas + estimateGas * 0.3, Number(process.env.ETH_GAS_LIMIT));
    this.sendHandler(this.ethManagerContract.methods.swapToken(secretAddrHex, mulDecimals(amount, decimals), erc20Address), {
      from: accounts[0],
      gas: new BN(gasLimit),
      gasPrice: await getGasPrice(this.web3),
    }, callback)

  };

  checkEthBalance = async (erc20Address, addr) => {
    const MyERC20Json = require('../out/MyERC20.json');
    const erc20Contract = new this.web3.eth.Contract(MyERC20Json.abi, erc20Address);

    return await erc20Contract.methods.balanceOf(addr).call();
  };

  tokenDetails = async erc20Address => {
    if (!this.web3.utils.isAddress(erc20Address)) {
      throw new Error('Invalid token address');
    }

    const MyERC20Json = require('../out/MyERC20.json');
    const erc20Contract = new this.web3.eth.Contract(MyERC20Json.abi, erc20Address);

    let name = '';
    let symbol = '';
    // maker has some weird encoding for these.. so whatever
    if (erc20Address === '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2') {
      name = 'Maker';
      symbol = 'MKR';
    } else {
      name = await erc20Contract.methods.name().call();
      symbol = await erc20Contract.methods.symbol().call();
    }
    // todo: check if all the erc20s we care about have the decimals method (it's not required by the standard)
    const decimals = await erc20Contract.methods.decimals().call();

    return { name, symbol, decimals, erc20Address };
  };
}

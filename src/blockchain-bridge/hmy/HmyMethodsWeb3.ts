import { mulDecimals } from '../../utils';
import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';
import { getAddress } from '@harmony-js/crypto';
const BN = require('bn.js');

interface IHmyMethodsInitParams {
  web3: Web3;
  hmyTokenContract: Contract;
  hmyManagerContract: Contract;
  hmyManagerContractAddress: string;
  options?: { gasPrice: number; gasLimit: number };
}

export class HmyMethodsWeb3 {
  private web3: Web3;
  private hmyTokenContract: Contract;
  private hmyManagerContract: Contract;
  hmyManagerContractAddress: string;
  // private options = { gasPrice: 3000000000, gasLimit: 6721900 };

  constructor(params: IHmyMethodsInitParams) {
    this.web3 = params.web3;
    this.hmyTokenContract = params.hmyTokenContract;
    this.hmyManagerContract = params.hmyManagerContract;
    this.hmyManagerContractAddress = params.hmyManagerContractAddress;

    // if (params.options) {
    //   this.options = params.options;
    // }
  }

  approveHmyManger = async (amount, sendTxCallback?) => {
    // @ts-ignore
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

    if (Number(amount) === 0) {
      sendTxCallback('skip');
      return;
    }

    const res = await this.hmyTokenContract.methods
      .approve(this.hmyManagerContractAddress, mulDecimals(amount, 18))
      .send({
        from: accounts[0],
        gasLimit: process.env.GAS_LIMIT,
        gasPrice: process.env.GAS_PRICE,
      })
      .on('transactionHash', sendTxCallback);

    return res;
  };

  burnToken = async (userAddr, amount, sendTxCallback?) => {
    // @ts-ignore
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

    const addrHex = getAddress(userAddr).checksum;

    let res = await this.hmyManagerContract.methods
      .burnToken(mulDecimals(amount, 18), addrHex)
      .send({
        from: accounts[0],
        gasLimit: process.env.GAS_LIMIT,
        gasPrice: process.env.GAS_PRICE,
      })
      .on('transactionHash', sendTxCallback);

    return res;
  };

  checkHmyBalance = async (addr: string) => {
    const addrHex = getAddress(addr).checksum;

    return await this.hmyTokenContract.methods.balanceOf(addrHex).call();
  };

  totalSupply = async () => {
    return await this.hmyTokenContract.methods.totalSupply().call();
  };

  allowance = async (addr: string) => {
    const addrHex = getAddress(addr).checksum;

    return await this.hmyTokenContract.methods
      .allowance(addrHex, this.hmyManagerContractAddress)
      .call();
  };
}

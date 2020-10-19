import * as agent from 'superagent';
import { Contract } from 'web3-eth-contract';
import { getAddress } from '@harmony-js/crypto';
import Web3 from 'web3';
import { divDecimals, mulDecimals } from '../../utils';
const BN = require('bn.js');

export interface IEthMethodsInitParams {
  web3: Web3;
  ethManagerContract: Contract;
  ethManagerAddress: string;
  ethTokenContract: Contract;
}

export class EthMethods {
  private web3: Web3;
  private ethManagerContract: Contract;
  private ethTokenContract: Contract;
  private ethManagerAddress: string;

  constructor(params: IEthMethodsInitParams) {
    this.web3 = params.web3;
    this.ethManagerContract = params.ethManagerContract;
    this.ethTokenContract = params.ethTokenContract;
    this.ethManagerAddress = params.ethManagerAddress;
  }

  approveEthManger = async (amount, sendTxCallback?) => {
    // @ts-ignore
    const accounts = await ethereum.enable();

    const info = await agent.get('https://data-api.defipulse.com/api/v1/egs/api/ethgasAPI.json?api-key=babbb3d37bf13922c3c0cd578aa97b97116930b18461d1db2663059edeb1')
    const gasPrice = mulDecimals(info.body.safeLow, 8);

    return await this.ethTokenContract.methods
      .approve(this.ethManagerAddress, mulDecimals(amount, 18))
      .send({
        from: accounts[0],
        gas: process.env.ETH_GAS_LIMIT,
        gasPrice,
      })
      .on('transactionHash', hash => sendTxCallback(hash));
  };

  lockToken = async (userAddr, amount, sendTxCallback?) => {
    // @ts-ignore
    const accounts = await ethereum.enable();

    const hmyAddrHex = getAddress(userAddr).checksum;

    const estimateGas = await this.ethManagerContract.methods
      .lockToken(mulDecimals(amount, 18), hmyAddrHex)
      .estimateGas({ from: accounts[0] });

    const gasLimit = Math.max(
      estimateGas + estimateGas * 0.3,
      Number(process.env.ETH_GAS_LIMIT),
    );

    const info = await agent.get('https://data-api.defipulse.com/api/v1/egs/api/ethgasAPI.json?api-key=babbb3d37bf13922c3c0cd578aa97b97116930b18461d1db2663059edeb1')
    const gasPrice = mulDecimals(info.body.safeLow, 8);

    let transaction = await this.ethManagerContract.methods
      .lockToken(mulDecimals(amount, 18), hmyAddrHex)
      .send({
        from: accounts[0],
        gas: new BN(gasLimit),
        gasPrice,
      })
      .on('transactionHash', hash => sendTxCallback(hash));

    return transaction.events.Locked;
  };

  checkEthBalance = async addr => {
    return await this.ethTokenContract.methods.balanceOf(addr).call();
  };
}

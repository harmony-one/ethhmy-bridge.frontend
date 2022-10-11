import { Harmony } from '@harmony-js/core';
import { Contract } from '@harmony-js/contract';
import { connectToOneWallet } from './helpers';
import { mulDecimals } from '../../utils';
import { getAddress } from '@harmony-js/crypto';
import BN from 'bn.js';

interface IHmyMethodsInitParams {
  hmy: Harmony;
  hmyManagerContract: Contract;
  options?: { gasPrice: number; gasLimit: number };
}

export class HmyMethodsHRC20 {
  private hmy: Harmony;
  private hmyManagerContract: Contract;
  private options = {
    gasPrice: Number(process.env.GAS_PRICE),
    gasLimit: 6721900,
  };

  constructor(params: IHmyMethodsInitParams) {
    this.hmy = params.hmy;
    this.hmyManagerContract = params.hmyManagerContract;

    if (params.options) {
      this.options = params.options;
    }
  }

  approveHmyManger = (hrc20Address, amount, decimals, sendTxCallback?) => {
    const tokenJson = require('../out/MyERC20');
    const hmyTokenContract = this.hmy.contracts.createContract(
      tokenJson.abi,
      hrc20Address,
    );

    return new Promise(async (resolve, reject) => {
      try {
        if (Number(amount) === 0) {
          sendTxCallback('skip');
          return resolve();
        }

        // TODO
        await connectToOneWallet(hmyTokenContract.wallet, null, reject);

        const res = await hmyTokenContract.methods
          .approve(
            this.hmyManagerContract.address,
            mulDecimals(amount, decimals),
          )
          .send(this.options)
          .on('transactionHash', sendTxCallback);

        resolve(res);
      } catch (e) {
        reject(e);
      }
    });
  };

  checkHmyBalance = async (hrc20Address, addr: string): Promise<BN> => {
    const tokenJson = require('../out/MyERC20');
    const hmyTokenContract = this.hmy.contracts.createContract(
      tokenJson.abi,
      hrc20Address,
    );

    const addrHex = this.hmy.crypto.getAddress(addr).checksum;

    return await hmyTokenContract.methods.balanceOf(addrHex).call(this.options);
  };

  /////////////////////////////////////////
  /////////////////////////////////////////
  /////////////////////////////////////////
  /////////////////////////////////////////
  /////////////////////////////////////////

  lockToken = async (
    erc20Address,
    userAddr,
    amount,
    decimals,
    sendTxCallback?,
  ) => {
    return new Promise(async (resolve, reject) => {
      try {
        // TODO
        const hmyAddrHex = getAddress(userAddr).checksum;

        await connectToOneWallet(this.hmyManagerContract.wallet, null, reject);

        const res = await this.hmyManagerContract.methods
          .lockToken(erc20Address, mulDecimals(amount, decimals), hmyAddrHex)
          .send(this.options)
          .on('transactionHash', sendTxCallback);

        // return transaction.events.Locked;

        resolve(res);
      } catch (e) {
        reject(e);
      }
    });
  };

  lockOne = async (userAddr, amount, sendTxCallback?) => {
    return new Promise(async (resolve, reject) => {
      try {
        // TODO
        // const hmyAddrHex = getAddress(userAddr).checksum;

        await connectToOneWallet(this.hmyManagerContract.wallet, null, reject);

        const res = await this.hmyManagerContract.methods
          .lockOne(mulDecimals(amount, 18), userAddr)
          .send({ ...this.options, value: mulDecimals(amount, 18) })
          .on('transactionHash', sendTxCallback);

        // return transaction.events.Locked;

        resolve(res);
      } catch (e) {
        reject(e);
      }
    });
  };

  tokenDetails = async erc20Address => {
    const tokenJson = require('../out/MyERC20');
    const erc20Contract = this.hmy.contracts.createContract(
      tokenJson.abi,
      erc20Address,
    );

    const name = await erc20Contract.methods.name().call(this.options);
    const symbol = await erc20Contract.methods.symbol().call(this.options);
    const decimals = await erc20Contract.methods.decimals().call(this.options);

    return {
      name,
      symbol,
      decimals: Number('0x' + decimals).toString(),
      erc20Address,
    };
  };

  token721Details = async erc721Address => {
    const tokenJson = require('../out/MyERC721');
    const erc20Contract = this.hmy.contracts.createContract(
      tokenJson.abi,
      erc721Address,
    );

    const name = await erc20Contract.methods.name().call(this.options);
    const symbol = await erc20Contract.methods.symbol().call(this.options);

    return { name, symbol, erc20Address: erc721Address };
  };

  allowance = async (addr: string, erc20Address: string) => {
    const tokenJson = require('../out/MyERC20');

    const hmyTokenContract = this.hmy.contracts.createContract(
      tokenJson.abi,
      erc20Address,
    );

    const addrHex = this.hmy.crypto.getAddress(addr).checksum;

    return await hmyTokenContract.methods
      .allowance(addrHex, this.hmyManagerContract.address)
      .call(this.options);
  };
}

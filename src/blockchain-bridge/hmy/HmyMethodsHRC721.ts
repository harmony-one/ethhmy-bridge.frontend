import { Harmony } from '@harmony-js/core';
import { Contract } from '@harmony-js/contract';
import { connectToOneWallet } from './helpers';
import { mulDecimals } from '../../utils';
import { getAddress } from '@harmony-js/crypto';

interface IHmyMethodsInitParams {
  hmy: Harmony;
  hmyManagerContract: Contract;
  options?: { gasPrice: number; gasLimit: number };
}

export class HmyMethodsHRC721 {
  private hmy: Harmony;
  private hmyManagerContract: Contract;
  private options = { gasPrice: 1000000000, gasLimit: 6721900 };

  constructor(params: IHmyMethodsInitParams) {
    this.hmy = params.hmy;
    this.hmyManagerContract = params.hmyManagerContract;

    if (params.options) {
      this.options = params.options;
    }
  }

  approveHmyManger = (hrc721Address, sendTxCallback?) => {
    const tokenJson = require('../out/MyERC721');
    const hmyTokenContract = this.hmy.contracts.createContract(
      tokenJson.abi,
      hrc721Address,
    );

    return new Promise(async (resolve, reject) => {
      try {
        await connectToOneWallet(hmyTokenContract.wallet, null, reject);

        // @ts-ignore
        let { address } = await window.onewallet.getAccount();
        const hmyAddrHex = getAddress(address).checksum;

        let res = await hmyTokenContract.methods
          .isApprovedForAll(hmyAddrHex, this.hmyManagerContract.address)
          .call(this.options);

        if (!res) {
          res = await hmyTokenContract.methods
            .setApprovalForAll(this.hmyManagerContract.address, true)
            .send(this.options)
            .on('transactionHash', sendTxCallback);

          resolve(res);
        } else {
          sendTxCallback('skip');
          resolve(res);
        }
      } catch (e) {
        reject(e);
      }
    });
  };

  /////////////////////////////////////////
  /////////////////////////////////////////
  /////////////////////////////////////////
  /////////////////////////////////////////
  /////////////////////////////////////////

  lockTokens = async (
    erc721Address,
    userAddr,
    tokenIds,
    sendTxCallback?,
  ) => {
    return new Promise(async (resolve, reject) => {
      try {
        // TODO
        const hmyAddrHex = getAddress(userAddr).checksum;

        await connectToOneWallet(this.hmyManagerContract.wallet, null, reject);

        const res = await this.hmyManagerContract.methods
          .lockTokens(erc721Address, tokenIds, hmyAddrHex)
          .send(this.options)
          .on('transactionHash', sendTxCallback);

        // return transaction.events.Locked;

        resolve(res);
      } catch (e) {
        reject(e);
      }
    });
  };

  tokenDetails = async erc721Address => {
    const tokenJson = require('../out/MyERC721');
    const erc721Contract = this.hmy.contracts.createContract(
      tokenJson.abi,
      erc721Address,
    );

    const name = await erc721Contract.methods.name().call(this.options);
    const symbol = await erc721Contract.methods.symbol().call(this.options);
    const baseURI = await erc721Contract.methods.baseURI().call(this.options);

    return { name, symbol, baseURI, erc721Address };
  };

  balanceOf =  async (erc721Address: string) => {
    const tokenJson = require('../out/MyERC721');
    // @ts-ignore
    let { address } = await window.onewallet.getAccount();
    const hmyAddrHex = getAddress(address).checksum;
    const erc721Contract = this.hmy.contracts.createContract(
      tokenJson.abi,
      erc721Address,
    );

    return await erc721Contract.methods.balanceOf(hmyAddrHex).call(this.options);
  };


  allowance = async (addr: string, erc721Address: string) => {
    const tokenJson = require('../out/MyERC721');

    const hmyTokenContract = this.hmy.contracts.createContract(
      tokenJson.abi,
      erc721Address,
    );

    const addrHex = this.hmy.crypto.getAddress(addr).checksum;

    return await hmyTokenContract.methods
      .allowance(addrHex, this.hmyManagerContract.address)
      .call(this.options);
  };
}

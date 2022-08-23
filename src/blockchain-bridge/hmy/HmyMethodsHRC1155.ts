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

export class HmyMethodsHRC1155 {
  private hmy: Harmony;
  private hmyManagerContract: Contract;
  private options = { gasPrice: Number(process.env.GAS_PRICE), gasLimit: 6721900 };

  constructor(params: IHmyMethodsInitParams) {
    this.hmy = params.hmy;
    this.hmyManagerContract = params.hmyManagerContract;

    if (params.options) {
      this.options = params.options;
    }
  }

  approveHmyManger = (hrc1155Address, sendTxCallback?) => {
    const tokenJson = require('../out/MyERC1155');
    const hmyTokenContract = this.hmy.contracts.createContract(
      tokenJson.abi,
      hrc1155Address,
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
    erc1155Address,
    userAddr,
    tokenIds,
    amounts,
    sendTxCallback?,
  ) => {
    return new Promise(async (resolve, reject) => {
      try {
        // TODO
        const hmyAddrHex = getAddress(userAddr).checksum;

        await connectToOneWallet(this.hmyManagerContract.wallet, null, reject);

        const res = await this.hmyManagerContract.methods
          .lockHRC1155Tokens(erc1155Address, tokenIds, hmyAddrHex, amounts, [])
          .send(this.options)
          .on('transactionHash', sendTxCallback);

        // return transaction.events.Locked;

        resolve(res);
      } catch (e) {
        reject(e);
      }
    });
  };

  tokenDetails = async erc1155Address => {
    const tokenJson = require('../out/MyERC1155');
    const erc1155Contract = this.hmy.contracts.createContract(
      tokenJson.abi,
      erc1155Address,
    );

    let tryOrDefault = async <T>(p: Promise<T>, d: T) => {
      try {
        return await p;
      } catch (e) {
        return d;
      }
    };

    const name = await tryOrDefault(erc1155Contract.methods.name().call(this.options), '');
    const symbol = await tryOrDefault(erc1155Contract.methods.symbol().call(this.options), '');
    const baseURI = await tryOrDefault(erc1155Contract.methods.uri(0).call(this.options), '');

    return { name, symbol, baseURI, erc1155Address };
  };

  balanceOf =  async (erc1155Address: string, tokenId: string) => {
    const tokenJson = require('../out/MyERC1155');
    // @ts-ignore
    let { address } = await window.onewallet.getAccount();
    const hmyAddrHex = getAddress(address).checksum;
    const erc721Contract = this.hmy.contracts.createContract(
      tokenJson.abi,
      erc1155Address,
    );

    return await erc721Contract.methods.balanceOf(hmyAddrHex, tokenId).call(this.options);
  };

  allowance = async (addr: string, erc1155Address: string) => {
    const tokenJson = require('../out/MyERC1155');

    const hmyTokenContract = this.hmy.contracts.createContract(
      tokenJson.abi,
      erc1155Address,
    );

    const addrHex = this.hmy.crypto.getAddress(addr).checksum;

    return await hmyTokenContract.methods
      .allowance(addrHex, this.hmyManagerContract.address)
      .call(this.options);
  };
}

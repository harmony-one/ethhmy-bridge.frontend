import { Harmony } from '@harmony-js/core';
import { Contract } from '@harmony-js/contract';
import { getAddress } from '@harmony-js/crypto';
import { connectToOneWallet } from './helpers';
import { mulDecimals } from '../../utils';
import BN from 'bn.js';
import { getGasPrice } from '../eth/helpers';

interface IHmyMethodsInitParams {
  hmy: Harmony;
  hmyManagerContract: Contract;
  hmyTokenManagerAddress: string;
  options?: { gasPrice: number; gasLimit: number };
}

export class HmyMethodsERC1155 {
  private hmy: Harmony;
  private hmyManagerContract: Contract;
  private hmyTokenManagerAddress: string;
  private options = { gasPrice: Number(process.env.GAS_PRICE), gasLimit: 6721900 };

  constructor(params: IHmyMethodsInitParams) {
    this.hmy = params.hmy;
    this.hmyManagerContract = params.hmyManagerContract;
    this.hmyTokenManagerAddress = params.hmyTokenManagerAddress;

    if (params.options) {
      this.options = params.options;
    }
  }

  setApprovalForAll = (hrc20Address, sendTxCallback?) => {
    const tokenJson = require('../out/MyERC1155');
    const hmyTokenContract = this.hmy.contracts.createContract(
      tokenJson.abi,
      hrc20Address,
    );

    return new Promise(async (resolve, reject) => {
      try {
        // TODO
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

  burnToken = async (
    hrc20Address,
    userAddr,
    amount,
    decimals,
    sendTxCallback?,
  ) => {
    return new Promise(async (resolve, reject) => {
      try {
        await connectToOneWallet(this.hmyManagerContract.wallet, null, reject);

        let response = await this.hmyManagerContract.methods
          .burnToken(hrc20Address, mulDecimals(amount, decimals), userAddr)
          .send(this.options)
          .on('transactionHash', sendTxCallback);

        resolve(response.transaction.id);
      } catch (e) {
        reject(e);
      }
    });
  };

  burnTokens = async (
    hrc1155Address,
    userAddr,
    tokenIds,
    amounts,
    sendTxCallback?,
  ) => {
    return new Promise(async (resolve, reject) => {
      try {
        await connectToOneWallet(this.hmyManagerContract.wallet, null, reject);
        const hmyAddrHex = getAddress(userAddr).checksum;
        const hrc1155AddressHex = getAddress(hrc1155Address).checksum;

        let response = await this.hmyManagerContract.methods
          .burnTokens(hrc1155AddressHex, tokenIds, hmyAddrHex, amounts)
          .send(this.options)
          .on('transactionHash', sendTxCallback);

        resolve(response.transaction.id);
      } catch (e) {
        reject(e);
      }
    });
  };

  getMappingFor = async erc1155TokenAddr => {
    const tokenManager = this.hmy.contracts.createContract(
      [
        {
          constant: true,
          inputs: [
            {
              internalType: 'address',
              name: '',
              type: 'address',
            },
          ],
          name: 'mappedTokens',
          outputs: [
            {
              internalType: 'address',
              name: '',
              type: 'address',
            },
          ],
          payable: false,
          stateMutability: 'view',
          type: 'function',
        },
      ],
      this.hmyTokenManagerAddress,
    );

    const res = await tokenManager.methods
      .mappedTokens(erc1155TokenAddr)
      .call(this.options);

    return res;
  };

  checkHmyBalance = async (hrc20Address, addr: string) => {
    const tokenJson = require('../out/MyERC1155');
    const hmyTokenContract = this.hmy.contracts.createContract(
      tokenJson.abi,
      hrc20Address,
    );

    const addrHex = this.hmy.crypto.getAddress(addr).checksum;

    return await hmyTokenContract.methods.balanceOf(addrHex).call(this.options);
  };

  totalSupply = async hrc20Address => {
    const tokenJson = require('../out/MyERC1155');
    const hmyTokenContract = this.hmy.contracts.createContract(
      tokenJson.abi,
      hrc20Address,
    );

    return await hmyTokenContract.methods.totalSupply().call(this.options);
  };

  allowance = async (addr: string, erc1155Address: string) => {
    const tokenJson = require('../out/MyERC1155');

    const tokenAddrHex = this.hmy.crypto.getAddress(erc1155Address).checksum;

    const hmyTokenContract = this.hmy.contracts.createContract(
      tokenJson.abi,
      tokenAddrHex,
    );

    const addrHex = this.hmy.crypto.getAddress(addr).checksum;

    return await hmyTokenContract.methods
      .allowance(addrHex, this.hmyManagerContract.address)
      .call(this.options);
  };

  lockOne = async (userAddr, amount, sendTxCallback?) => {
    return new Promise(async (resolve, reject) => {
      try {
        // TODO
        // const hmyAddrHex = getAddress(userAddr).checksum;

        const managerContract = this.hmy.contracts.createContract(
          [
            {
              constant: false,
              inputs: [
                {
                  internalType: 'uint256',
                  name: 'amount',
                  type: 'uint256',
                },
                {
                  internalType: 'address',
                  name: 'recipient',
                  type: 'address',
                },
              ],
              name: 'lockNative',
              outputs: [],
              payable: true,
              stateMutability: 'payable',
              type: 'function',
            },
          ],
          this.hmyManagerContract.address,
        );

        await connectToOneWallet(managerContract.wallet, null, reject);

        const res = await managerContract.methods
          .lockNative(mulDecimals(amount, 18), userAddr)
          .send({ ...this.options, value: mulDecimals(amount, 18) })
          .on('transactionHash', sendTxCallback);

        // return transaction.events.Locked;

        resolve(res);
      } catch (e) {
        reject(e);
      }
    });
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

  tokenDetails = async hrc20Address => {
    const hmyAddrHex = getAddress(hrc20Address).checksum;

    const MyERC1155Json = require('../out/MyERC1155');
    const erc1155Contract = this.hmy.contracts.createContract(
      MyERC1155Json.abi,
      hmyAddrHex,
    );

    const symbol = await erc1155Contract.methods.symbol().call(this.options);

    let name = symbol;

    try {
      name = await erc1155Contract.methods.name().call(this.options);
    } catch (e) {
      console.error(e);
    }

    const decimals = await erc1155Contract.methods.decimals().call(this.options);

    return { name, symbol, decimals: String(Number('0x' + decimals)), hrc20Address };
  };
}

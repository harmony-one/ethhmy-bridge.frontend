import { Harmony } from '@harmony-js/core';
import { Contract } from '@harmony-js/contract';
import { getAddress } from '@harmony-js/crypto';
import { connectToOneWallet } from './helpers';
import { mulDecimals } from '../../utils';

interface IHmyMethodsInitParams {
  hmy: Harmony;
  hmyManagerContract: Contract;
  hmyTokenManagerAddress: string;
  options?: { gasPrice: number; gasLimit: number };
}

export class HmyMethodsERC20 {
  private hmy: Harmony;
  private hmyManagerContract: Contract;
  private hmyTokenManagerAddress: string;
  private options = { gasPrice: 3000000000, gasLimit: 6721900 };

  constructor(params: IHmyMethodsInitParams) {
    this.hmy = params.hmy;
    this.hmyManagerContract = params.hmyManagerContract;
    this.hmyTokenManagerAddress = params.hmyTokenManagerAddress;

    if (params.options) {
      this.options = params.options;
    }
  }

  approveHmyManger = (hrc20Address, amount, decimals, sendTxCallback?) => {
    const tokenJson = require('../out/MyERC20.json');
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

  setApprovalForAll = (hrc20Address, sendTxCallback?) => {
    const tokenJson = require('../out/MyERC721.json');
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

  burnTokens = async (hrc20Address, userAddr, amount, sendTxCallback?) => {
    return new Promise(async (resolve, reject) => {
      try {
        await connectToOneWallet(this.hmyManagerContract.wallet, null, reject);

        let response = await this.hmyManagerContract.methods
          .burnTokens(hrc20Address, amount, userAddr)
          .send(this.options)
          .on('transactionHash', sendTxCallback);

        resolve(response.transaction.id);
      } catch (e) {
        reject(e);
      }
    });
  };

  getMappingFor = async erc20TokenAddr => {
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
      .mappedTokens(erc20TokenAddr)
      .call(this.options);

    return res;
  };

  checkHmyBalance = async (hrc20Address, addr: string) => {
    const tokenJson = require('../out/MyERC20.json');
    const hmyTokenContract = this.hmy.contracts.createContract(
      tokenJson.abi,
      hrc20Address,
    );

    const addrHex = this.hmy.crypto.getAddress(addr).checksum;

    return await hmyTokenContract.methods.balanceOf(addrHex).call(this.options);
  };

  totalSupply = async hrc20Address => {
    const tokenJson = require('../out/MyERC20.json');
    const hmyTokenContract = this.hmy.contracts.createContract(
      tokenJson.abi,
      hrc20Address,
    );

    return await hmyTokenContract.methods.totalSupply().call(this.options);
  };

  allowance = async (addr: string, erc20Address: string) => {
    const tokenJson = require('../out/MyERC20.json');

    const tokenAddrHex = this.hmy.crypto.getAddress(erc20Address).checksum;

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

  tokenDetails = async hrc20Address => {
    const hmyAddrHex = getAddress(hrc20Address).checksum;

    const MyERC20Json = require('../out/MyERC20.json');
    const erc20Contract = this.hmy.contracts.createContract(
      MyERC20Json.abi,
      hmyAddrHex,
    );

    const symbol = await erc20Contract.methods.symbol().call(this.options);

    let name = symbol;

    try {
      name = await erc20Contract.methods.name().call(this.options);
    } catch (e) {
      console.error(e);
    }

    const decimals = await erc20Contract.methods.decimals().call(this.options);

    return { name, symbol, decimals: String(Number('0x' + decimals)), hrc20Address };
  };
}

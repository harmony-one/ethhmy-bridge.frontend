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
  gasPrice?: number;
}

export class EthMethodsERC1155 {
  private web3: Web3;
  private ethManagerContract: Contract;
  private ethManagerAddress: string;
  gasPrice?: number;

  constructor(params: IEthMethodsInitParams) {
    this.web3 = params.web3;
    this.ethManagerContract = params.ethManagerContract;
    this.ethManagerAddress = params.ethManagerAddress;
    this.gasPrice = params.gasPrice;
  }

  approveEthManger = async (
    erc1155Address,
    amount,
    decimals,
    sendTxCallback?,
  ) => {
    // @ts-ignore
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });

    if (Number(amount) === 0) {
      sendTxCallback('skip');
      return;
    }

    const MyERC1155Json = require('../out/MyERC1155');
    const erc1155Contract = new this.web3.eth.Contract(
      MyERC1155Json.abi,
      erc1155Address,
    );

    const USDT_ADDR = '0xdac17f958d2ee523a2206206994597c13d831ec7'.toUpperCase();

    if (erc1155Address.toUpperCase() === USDT_ADDR) {
      const allowed = await this.allowance(accounts[0], erc1155Address);

      if (
        allowed > 0 &&
        mulDecimals(Number(amount), decimals).cmp(Number(this.allowance)) > 0
      ) {
        // reset to 0
        await erc1155Contract.methods.approve(this.ethManagerAddress, 0).send({
          from: accounts[0],
          gas: process.env.ETH_GAS_LIMIT,
          gasPrice: this.gasPrice
            ? this.gasPrice
            : await getGasPrice(this.web3),
        });
      }
    }

    await erc1155Contract.methods
      .approve(this.ethManagerAddress, mulDecimals(amount, decimals))
      .send({
        from: accounts[0],
        gas: process.env.ETH_GAS_LIMIT,
        gasPrice: this.gasPrice ? this.gasPrice : await getGasPrice(this.web3),
      })
      .on('transactionHash', hash => sendTxCallback(hash));
  };

  balanceOf =  async (erc1155Address: string, tokenId: string) => {
    const tokenJson = require('../out/MyERC1155');
    // @ts-ignore
    const accounts = await ethereum.enable();
    const erc1155Contract = new this.web3.eth.Contract(
      tokenJson.abi,
      erc1155Address,
    );

    return await erc1155Contract.methods.balanceOf(accounts[0], tokenId).call();
  };

  setApprovalForAllEthManger = async (erc1155Address, sendTxCallback?) => {
    // @ts-ignore
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });

    const MyERC1155Json = require('../out/MyERC721');
    const erc1155Contract = new this.web3.eth.Contract(
      MyERC1155Json.abi,
      erc1155Address,
    );

    let res = await erc1155Contract.methods
      .isApprovedForAll(accounts[0], this.ethManagerAddress)
      .call();

    if (!res) {
      await erc1155Contract.methods
        .setApprovalForAll(this.ethManagerAddress, true)
        .send({
          from: accounts[0],
          gas: process.env.ETH_GAS_LIMIT,
          gasPrice: await getGasPrice(this.web3),
        })
        .on('transactionHash', hash => sendTxCallback(hash));
    } else {
      sendTxCallback('skip');
    }
  };

  lockTokens = async (
    erc1155Address,
    userAddr,
    tokenIds,
    amounts,
    sendTxCallback?
  ) => {
    // @ts-ignore
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });

    const hmyAddrHex = getAddress(userAddr).checksum;

    const estimateGas = await this.ethManagerContract.methods
      .lockHRC1155Tokens(erc1155Address, tokenIds, hmyAddrHex, amounts, [])
      .estimateGas({ from: accounts[0] });

    const gasLimit = Math.max(
      estimateGas + estimateGas * 0.3,
      Number(process.env.ETH_GAS_LIMIT),
    );

    let transaction = await this.ethManagerContract.methods
      .lockHRC1155Tokens(erc1155Address, tokenIds, hmyAddrHex, amounts, [])
      .send({
        from: accounts[0],
        gas: new BN(gasLimit),
        gasPrice: await getGasPrice(this.web3),
      })
      .on('transactionHash', hash => sendTxCallback(hash));

    return transaction.events.Locked;
  };

  lockToken = async (
    erc1155Address,
    userAddr,
    amount,
    decimals,
    sendTxCallback?,
  ) => {
    // @ts-ignore
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });

    const hmyAddrHex = getAddress(userAddr).checksum;

    const estimateGas = await this.ethManagerContract.methods
      .lockToken(erc1155Address, mulDecimals(amount, decimals), hmyAddrHex)
      .estimateGas({ from: accounts[0] });

    const gasLimit = Math.max(
      estimateGas + estimateGas * 0.3,
      Number(process.env.ETH_GAS_LIMIT),
    );

    let transaction = await this.ethManagerContract.methods
      .lockToken(erc1155Address, mulDecimals(amount, decimals), hmyAddrHex)
      .send({
        from: accounts[0],
        gas: new BN(gasLimit),
        gasPrice: this.gasPrice ? this.gasPrice : await getGasPrice(this.web3),
      })
      .on('transactionHash', hash => sendTxCallback(hash));

    return transaction.events.Locked;
  };

  checkEthBalance = async (erc1155Address, addr) => {
    const MyERC1155Json = require('../out/MyERC1155');
    const erc1155Contract = new this.web3.eth.Contract(
      MyERC1155Json.abi,
      erc1155Address,
    );

    return await erc1155Contract.methods.balanceOf(addr).call();
  };

  tokenDetails = async erc1155Address => {
    if (!this.web3.utils.isAddress(erc1155Address)) {
      throw new Error('Invalid token address');
    }

    const MyERC1155Json = require('../out/MyERC1155');
    const erc1155Contract = new this.web3.eth.Contract(
      MyERC1155Json.abi,
      erc1155Address,
    );

    const symbol = await erc1155Contract.methods.symbol().call();

    let name = symbol;

    try {
      name = await erc1155Contract.methods.name().call();
    } catch (e) {
      console.error(e);
    }

    const decimals = await erc1155Contract.methods.decimals().call();

    return { name, symbol, decimals, erc1155Address };
  };

  tokenDetailsERC1155 = async erc1155Address => {
    const tokenJson = require('../out/MyERC1155');
    const erc1155Contract = new this.web3.eth.Contract(
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

    const name = await tryOrDefault(erc1155Contract.methods.name().call(), '');
    const symbol = await tryOrDefault(erc1155Contract.methods.symbol().call(), '');
    const baseURI = await erc1155Contract.methods.uri(0).call();

    return {
      name,
      symbol,
      baseURI,
      erc1155Address,
    };
  };

  allowance = async (addr: string, erc1155Address: string) => {
    if (!this.web3.utils.isAddress(erc1155Address)) {
      throw new Error('Invalid token address');
    }

    const MyERC1155Json = require('../out/MyERC1155');

    const erc1155Contract = new this.web3.eth.Contract(
      MyERC1155Json.abi,
      erc1155Address,
    );

    let res;

    try {
      res = await erc1155Contract.methods
        .allowance(addr, this.ethManagerAddress)
        .call();
    } catch (e) {
      console.error(e);
      debugger;
    }

    return res;
  };

  lockNative = async (userAddr, amount, sendTxCallback?) => {
    // @ts-ignore
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });

    const hmyAddrHex = getAddress(userAddr).checksum;

    const managerContract = new this.web3.eth.Contract(
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
      this.ethManagerAddress,
    );

    let response = await managerContract.methods
      .lockNative(mulDecimals(amount, 18), hmyAddrHex)
      .send({
        from: accounts[0],
        gas: process.env.ETH_GAS_LIMIT,
        gasPrice: await getGasPrice(this.web3),
        value: mulDecimals(amount, 18),
      })
      .on('transactionHash', hash => sendTxCallback(hash));

    return response;
  };
}

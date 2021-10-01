import { mulDecimals } from '../../utils';
import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';
import { getAddress } from '@harmony-js/crypto';
const BN = require('bn.js');

interface IHmyMethodsInitParams {
  web3: Web3;
  hmyManagerContract: Contract;
  hmyManagerContractAddress: string;
  options?: { gasPrice: number; gasLimit: number };
  hmyTokenManagerAddress: string;
}

export class HmyMethodsERC20Web3 {
  web3: Web3;
  private hmyManagerContract: Contract;
  hmyManagerContractAddress: string;
  private hmyTokenManagerAddress: string;
  // private options = { gasPrice: 3000000000, gasLimit: 6721900 };

  constructor(params: IHmyMethodsInitParams) {
    this.web3 = params.web3;
    this.hmyManagerContract = params.hmyManagerContract;
    this.hmyManagerContractAddress = params.hmyManagerContractAddress;
    this.hmyTokenManagerAddress = params.hmyTokenManagerAddress;

    // if (params.options) {
    //   this.options = params.options;
    // }
  }

  approveHmyManger = async (
    hrc20Address,
    amount,
    decimals,
    sendTxCallback?,
  ) => {
    const tokenJson = require('../out/MyERC20.json');
    const hmyTokenContract = new this.web3.eth.Contract(
      tokenJson.abi,
      hrc20Address,
    );
    // @ts-ignore
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

    if (Number(amount) === 0) {
      sendTxCallback('skip');
      return;
    }

    const res = await hmyTokenContract.methods
      .approve(this.hmyManagerContractAddress, mulDecimals(amount, decimals))
      .send({
        from: accounts[0],
        gasLimit: process.env.GAS_LIMIT,
        gasPrice: process.env.GAS_PRICE,
      })
      .on('transactionHash', sendTxCallback);

    return res;
  };

  setApprovalForAll = async (hrc20Address, sendTxCallback?) => {
    const tokenJson = require('../out/MyERC721.json');
    const hmyTokenContract = new this.web3.eth.Contract(
      tokenJson.abi,
      hrc20Address,
    );
    // @ts-ignore
    // @ts-ignore
const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

    let res = await hmyTokenContract.methods
      .isApprovedForAll(accounts[0], this.hmyManagerContractAddress)
      .call();

    if (!res) {
      res = await hmyTokenContract.methods
        .setApprovalForAll(this.hmyManagerContractAddress, true)
        .send({
          from: accounts[0],
          gasLimit: process.env.GAS_LIMIT,
          gasPrice: process.env.GAS_PRICE,
        })
        .on('transactionHash', sendTxCallback);

      return res;
    } else {
      sendTxCallback('skip');
      return res;
    }
  };

  burnToken = async (
    hrc20Address,
    userAddr,
    amount,
    decimals,
    sendTxCallback?,
  ) => {
    // @ts-ignore
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

    let response = await this.hmyManagerContract.methods
      .burnToken(hrc20Address, mulDecimals(amount, decimals), userAddr)
      .send({
        from: accounts[0],
        gasLimit: process.env.GAS_LIMIT,
        gasPrice: process.env.GAS_PRICE,
      })
      .on('transactionHash', sendTxCallback);

    return response;
  };

  burnTokens = async (hrc20Address, userAddr, amount, sendTxCallback?) => {
    // @ts-ignore
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

    let response = await this.hmyManagerContract.methods
      .burnTokens(hrc20Address, amount, userAddr)
      .send({
        from: accounts[0],
        gasLimit: process.env.GAS_LIMIT,
        gasPrice: process.env.GAS_PRICE,
      })
      .on('transactionHash', sendTxCallback);

    return response;
  };

  getMappingFor = async erc20TokenAddr => {
    const tokenManager = new this.web3.eth.Contract(
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

    const res = await tokenManager.methods.mappedTokens(erc20TokenAddr).call();

    return res;
  };

  checkHmyBalance = async (hrc20Address, addr: string) => {
    const tokenJson = require('../out/MyERC20.json');
    const hmyTokenContract = new this.web3.eth.Contract(
      tokenJson.abi,
      hrc20Address,
    );

    const addrHex = getAddress(addr).checksum;

    return await hmyTokenContract.methods.balanceOf(addrHex).call();
  };

  totalSupply = async hrc20Address => {
    const tokenJson = require('../out/MyERC20.json');
    const hmyTokenContract = new this.web3.eth.Contract(
      tokenJson.abi,
      hrc20Address,
    );

    return await hmyTokenContract.methods.totalSupply().call();
  };

  allowance = async (addr: string, erc20Address: string) => {
    const addrHex = getAddress(addr).checksum;

    const tokenJson = require('../out/MyERC20.json');
    const hmyTokenContract = new this.web3.eth.Contract(
      tokenJson.abi,
      erc20Address,
    );

    return await hmyTokenContract.methods
      .allowance(addrHex, this.hmyManagerContractAddress)
      .call();
  };

  lockOne = async (userAddr, amount, sendTxCallback?) => {
    // @ts-ignore
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

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
      this.hmyManagerContractAddress,
    );

    const res = await managerContract.methods
      .lockNative(mulDecimals(amount, 18), hmyAddrHex)
      .send({
        from: accounts[0],
        gasLimit: process.env.GAS_LIMIT,
        gasPrice: process.env.GAS_PRICE,
        value: mulDecimals(amount, 18),
      })
      .on('transactionHash', sendTxCallback);

    return res;
  };
}

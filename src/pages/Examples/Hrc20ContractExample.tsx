import * as React from 'react';
import { useState } from 'react';
import detectEthereumProvider from '@metamask/detect-provider';
import Web3 from 'web3';
import { mulDecimals } from '../../utils';
const BN = require('bn.js');

export const Hrc20ContractExample = () => {
  const [account, setAccount] = useState('');
  const [authorised, setAuthorised] = useState(false);

  const handleAccountsChanged = accounts => {
    if (accounts.length === 0) {
      console.error('Not found accounts');
    } else {
      setAccount(accounts[0]);

      console.log('Your address: ', account);
    }
  };

  const signInMetamask = async () => {
    const provider = await detectEthereumProvider();

    // @ts-ignore
    if (provider !== window.ethereum) {
      console.error('Do you have multiple wallets installed?');
    }

    if (!provider) {
      console.error('MetaMask not found');
      return;
    }

    // MetaMask events
    provider.on('accountsChanged', handleAccountsChanged);

    provider.on('disconnect', () => {
      console.log('disconnect');
      setAuthorised(false);
      setAccount('');
    });

    provider.on('chainIdChanged', chainId =>
      console.log('chainIdChanged', chainId),
    );
    provider.on('networkChanged', chainId =>
      console.log('networkChanged', chainId),
    );

    provider
      .request({ method: 'eth_requestAccounts' })
      .then(async params => {
        handleAccountsChanged(params);
        setAuthorised(true);
      })
      .catch(err => {
        setAuthorised(false);

        if (err.code === 4001) {
          console.error('Please connect to MetaMask.');
        } else {
          console.error(err);
        }
      });
  };

  const sendHRC20Tokens = async () => {
    // @ts-ignore
    const web3 = new Web3(window.ethereum);

    const hmyBUSDJson = require('./MyERC20.json');
    const contract = new web3.eth.Contract(
      hmyBUSDJson.abi,
      '0xc4860463c59d59a9afac9fde35dff9da363e8425',
    ); // HRC20 BUSD

    const gasLimit = 6721900;

    let result;

    try {
      const gasPrice = new BN(await web3.eth.getGasPrice()).mul(new BN(1));

      const receiverAddress = '0x430506383F1Ac31F5FdF5b49ADb77faC604657B2';

      result = await contract.methods
        .transfer(receiverAddress, mulDecimals(1, 18))
        .send({
          from: account,
          gasPrice,
          gasLimit,
        })
        .on('error', console.error)
        .on('transactionHash', transactionHash => {
          alert(`Transaction is sending: ${transactionHash}`);
        });
    } catch (e) {
      console.error(e);
    }

    console.log(`Send tx: ${result.transactionHash} result: `, result.status);

    alert(`Send tx: ${result.transactionHash} result: ${result.status}`);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '200px',
        margin: '100px auto',
      }}
    >
      <span>Your account: {account}</span>
      <button onClick={signInMetamask}>Sign In MetaMask</button>
      <button onClick={sendHRC20Tokens}>Send HRC20</button>
    </div>
  );
};

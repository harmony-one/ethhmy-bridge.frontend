import { ethBUSDContract, managerContract, web3 } from '../ethSdk';
import Web3 from 'web3';
import { hmy } from '../sdk';

const BN = require('bn.js');

async function checkEthBalance(contract, addr) {
  return await ethBUSDContract.methods.balanceOf(addr).call();
}

async function approveEthManger(amount, sendTxCallback?) {
  // @ts-ignore
  const accounts = await ethereum.enable();

  return await ethBUSDContract.methods
    .approve(process.env.ETH_MANAGER_CONTRACT, amount)
    .send({
      from: accounts[0],
      gas: process.env.ETH_GAS_LIMIT,
      gasPrice: new BN(await web3.eth.getGasPrice()).mul(new BN(1)),
    })
    .on('transactionHash', hash => sendTxCallback(hash));
}

async function lockToken(userAddr, amount, sendTxCallback?) {
  // @ts-ignore
  const accounts = await ethereum.enable();

  const hmyAddrHex = hmy.crypto.getAddress(userAddr).checksum;

  let transaction = await managerContract.methods
    .lockToken(amount, hmyAddrHex)
    .send({
      from: accounts[0],
      gas: process.env.ETH_GAS_LIMIT,
      gasPrice: new BN(await web3.eth.getGasPrice()).mul(new BN(1)),
    }).on('transactionHash', hash => sendTxCallback(hash));

  return transaction.events.Locked;
}

async function unlockToken(userAddr, amount, receiptId) {
  const web3 = new Web3(process.env.ETH_NODE_URL);
  let ethMasterAccount = web3.eth.accounts.privateKeyToAccount(
    process.env.ETH_MASTER_PRIVATE_KEY,
  );
  web3.eth.accounts.wallet.add(ethMasterAccount);
  web3.eth.accounts.wallet.add(ethMasterAccount);
  web3.eth.defaultAccount = ethMasterAccount.address;

  const EthManagerJson = require('../out/BUSDEthManager.json');
  const managerContract = new web3.eth.Contract(
    EthManagerJson.abi,
    process.env.ETH_MANAGER_CONTRACT,
  );

  await managerContract.methods.unlockToken(amount, userAddr, receiptId).send({
    from: ethMasterAccount.address,
    gas: process.env.ETH_GAS_LIMIT,
    gasPrice: new BN(await web3.eth.getGasPrice()).mul(new BN(1)), //new BN(process.env.ETH_GAS_PRICE)
  });
}

export { checkEthBalance, approveEthManger, lockToken, unlockToken };

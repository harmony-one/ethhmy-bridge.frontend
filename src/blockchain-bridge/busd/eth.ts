import { ethBUSDContract, managerContract, web3 } from '../ethSdk';
import Web3 from 'web3';

const BN = require('bn.js');

// async function initBUSDEth(contractAddr) {
//   const web3 = new Web3(process.env.ETH_NODE_URL);
//   let ethMasterAccount = web3.eth.accounts.privateKeyToAccount(
//     process.env.ETH_MASTER_PRIVATE_KEY,
//   );
//   web3.eth.accounts.wallet.add(ethMasterAccount);
//   web3.eth.accounts.wallet.add(ethMasterAccount);
//   web3.eth.defaultAccount = ethMasterAccount.address;
//   ethMasterAccount = ethMasterAccount.address;
//
//   const busdJson = require('../out/BUSDImplementation.json');
//   const busdContract = new web3.eth.Contract(busdJson.abi, contractAddr);
//   await ethBUSDContract.methods.unpause().send({
//     from: ethMasterAccount,
//     gas: process.env.ETH_GAS_LIMIT,
//     gasPrice: new BN(await web3.eth.getGasPrice()).mul(new BN(1)),
//   });
// }

async function checkEthBalance(contract, addr) {
  return await ethBUSDContract.methods.balanceOf(addr).call();
}

async function approveEthManger(amount) {
  // @ts-ignore
  const accounts = await ethereum.enable();

  await ethBUSDContract.methods
    .approve(process.env.ETH_MANAGER_CONTRACT, amount)
    .send({
      from: accounts[0],
      gas: process.env.ETH_GAS_LIMIT,
      gasPrice: new BN(await web3.eth.getGasPrice()).mul(new BN(1)),
    });
}

async function lockToken(userAddr, amount) {
  // @ts-ignore
  const accounts = await ethereum.enable();

  let transaction = await managerContract.methods
    .lockToken(amount, userAddr)
    .send({
      from: accounts[0],
      gas: process.env.ETH_GAS_LIMIT,
      gasPrice: new BN(await web3.eth.getGasPrice()).mul(new BN(1)),
    });
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

export {
  checkEthBalance,
  approveEthManger,
  lockToken,
  unlockToken
};

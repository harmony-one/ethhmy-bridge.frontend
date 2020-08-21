import { connectToOneWallet, hmy } from '../sdk';

let options = { gasPrice: 1000000000, gasLimit: 6721900 };

async function initBUSDHmy(contractAddr) {
  const busdJson = require('../out/BUSDImplementation.json');
  let busdContract = hmy.contracts.createContract(busdJson.abi, contractAddr);
  busdContract.wallet.setSigner(process.env.ADMIN);
  await busdContract.methods.unpause().send(options);
}

async function setSupplyControllerBUSDHmy(contractAddr, managerAddr) {
  const busdJson = require('../out/BUSDImplementation.json');
  let busdContract = hmy.contracts.createContract(busdJson.abi, contractAddr);
  busdContract.wallet.setSigner(process.env.ADMIN);
  await busdContract.methods.setSupplyController(managerAddr).send(options);
}

async function checkHmyBalance(contract, addr) {
  const hmyBUSDJson = require('../out/BUSDImplementation.json');
  let hmyBUSDContract = hmy.contracts.createContract(hmyBUSDJson.abi, contract);
  let options = { gasPrice: 1000000000, gasLimit: 6721900 };
  let res = await hmyBUSDContract.methods.balanceOf(addr).call(options);
  return res;
}

async function mintBUSDHmy(contractAddr, accountAddr, amount) {
  const busdJson = require('../out/BUSDImplementation.json');
  let busdContract = hmy.contracts.createContract(busdJson.abi, contractAddr);
  busdContract.wallet.setSigner(process.env.ADMIN);
  let options = { gasPrice: 1000000000, gasLimit: 6721900 };
  await busdContract.methods.increaseSupply(accountAddr, amount).send(options);
  await busdContract.methods.transfer(accountAddr, amount).send(options);
}

async function approveHmyManger(contractAddr, managerAddr, amount) {
  return new Promise(async (resolve, reject) => {
    try {
      const hmyBUSDJson = require('../out/BUSDImplementation.json');
      let hmyBUSDContract = hmy.contracts.createContract(
        hmyBUSDJson.abi,
        contractAddr,
      );

      // hmyBUSDContract.wallet.setSigner(process.env.ONE_USER);

      await connectToOneWallet(hmyBUSDContract.wallet, null, reject);

      let options = { gasPrice: 1000000000, gasLimit: 6721900 };

      const res = await hmyBUSDContract.methods
        .approve(managerAddr, amount)
        .send(options);

      resolve(res);
    } catch (e) {
      reject(e);
    }
  });
}

async function mintToken(managerAddr, userAddr, amount, receiptId) {
  const hmyManagerJson = require('../out/BUSDHmyManager.json');
  let hmyManagerContract = hmy.contracts.createContract(
    hmyManagerJson.abi,
    managerAddr,
  );

  // hmyManagerContract.wallet.setSigner(process.env.HMY_ADMIN_ADDRESS);
  hmyManagerContract.wallet.addByPrivateKey(process.env.HMY_ADMIN_PRIVATE_KEY);

  let options = { gasPrice: 1000000000, gasLimit: 6721900 };

  await hmyManagerContract.methods
    .mintToken(amount, userAddr, receiptId)
    .send(options);
}

async function burnToken(managerAddr, userAddr, amount) {
  return new Promise(async (resolve, reject) => {
    try {
      const hmyManagerJson = require('../out/BUSDHmyManager.json');
      let hmyManagerContract = hmy.contracts.createContract(
        hmyManagerJson.abi,
        managerAddr,
      );

      // hmyBUSDContract.wallet.setSigner(process.env.ONE_USER);

      await connectToOneWallet(hmyManagerContract.wallet, null, reject);

      let options = { gasPrice: 1000000000, gasLimit: 6721900 };

      let response = await hmyManagerContract.methods
        .burnToken(amount, userAddr)
        .send(options);

      resolve(response.transaction.id);
    } catch (e) {
      reject(e);
    }
  });
}

export {
  initBUSDHmy,
  setSupplyControllerBUSDHmy,
  checkHmyBalance,
  mintBUSDHmy,
  approveHmyManger,
  mintToken,
  burnToken,
};

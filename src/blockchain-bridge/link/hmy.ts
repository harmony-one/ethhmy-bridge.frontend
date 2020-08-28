import { connectToOneWallet, hmy } from '../sdk';

async function approveHmyManger(amount, sendTxCallback?) {
  return new Promise(async (resolve, reject) => {
    try {
      const hmyBUSDJson = require('../out/LinkToken.json');
      let hmyBUSDContract = hmy.contracts.createContract(
        hmyBUSDJson.abi,
        process.env.HMY_LINK_CONTRACT,
      );

      // hmyBUSDContract.wallet.setSigner(process.env.ONE_USER);

      await connectToOneWallet(hmyBUSDContract.wallet, null, reject);

      let options = { gasPrice: 1000000000, gasLimit: 6721900 };

      const res = await hmyBUSDContract.methods
        .approve(process.env.HMY_LINK_MANAGER_CONTRACT, amount)
        .send(options)
        .on('transactionHash', sendTxCallback);

      resolve(res);
    } catch (e) {
      reject(e);
    }
  });
}

async function burnToken(userAddr, amount, sendTxCallback?) {
  return new Promise(async (resolve, reject) => {
    try {
      const hmyManagerJson = require('../out/LINKHmyManager.json');
      let hmyManagerContract = hmy.contracts.createContract(
        hmyManagerJson.abi,
        process.env.HMY_LINK_MANAGER_CONTRACT,
      );

      await connectToOneWallet(hmyManagerContract.wallet, null, reject);

      let options = { gasPrice: 1000000000, gasLimit: 6721900 };

      let response = await hmyManagerContract.methods
        .burnToken(amount, userAddr)
        .send(options)
        .on('transactionHash', sendTxCallback);

      resolve(response.transaction.id);
    } catch (e) {
      reject(e);
    }
  });
}

async function checkHmyBalance(contract, addr) {
  const hmyBUSDJson = require('../out/LinkToken.json');
  let hmyBUSDContract = hmy.contracts.createContract(hmyBUSDJson.abi, contract);
  let options = { gasPrice: 1000000000, gasLimit: 6721900 };
  let res = await hmyBUSDContract.methods.balanceOf(addr).call(options);
  return res;
}

export { approveHmyManger, burnToken, checkHmyBalance };

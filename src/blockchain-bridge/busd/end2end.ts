import { sleep, BLOCK_TO_FINALITY, AVG_BLOCK_TIME } from '../utils';

import * as eth from './eth';
import * as hmyMethos from './hmy';
import { web3 } from '../ethSdk';
import { hmy } from '../sdk';
import BN from 'bn.js';

export const busd = '0x22d90673720A9d83D2BdE59AA604ABeBFF90fC1c';
export const busdHmy = '0xc496f1010d3c052f6e8ba402d05832540f4cb803';
export const hmyManager = '0xa2d6f0e9ef3b83b3cb069d5006895a5257b8655b';

export const getEthBalanceBUSD = async ethAddress => {
  return await eth.checkEthBalance(busd, ethAddress);
};

export const getHmyBalanceBUSD = async hmyAddress => {
  const addrHex = hmy.crypto.getAddress(hmyAddress).checksum;

  return await hmyMethos.checkHmyBalance(busdHmy, addrHex);
};

export const getEthBalance = (ethAddress): Promise<string> => {
  return new Promise((resolve, reject) => {
    web3.eth.getBalance(ethAddress, (err, balance) => {
      if (err) {
        reject(err);
      }

      // const rez = String(new BN(balance).div(new BN(1e18)));

      resolve(String(Number(balance) / 1e18));
    });
  });
};

export const ethToOneBUSD = async ({
  amount,
  ethUserAddress,
  hmyUserAddress,
  setActionStep,
}) => {
  // user approve eth manager to lock tokens
  try {
    const ethAddrHex = hmy.crypto.getAddress(ethUserAddress).checksum;
    const hmyAddrHex = hmy.crypto.getAddress(hmyUserAddress).checksum;

    setActionStep(0);

    await eth.approveEthManger(amount);

    setActionStep(1);

    // wait sufficient to confirm the transaction went through
    const lockedEvent = await eth.lockToken(hmyAddrHex, amount);

    const expectedBlockNumber = lockedEvent.blockNumber + BLOCK_TO_FINALITY;
    let count = 1;

    while (true) {
      let blockNumber = await web3.eth.getBlockNumber();
      if (blockNumber <= expectedBlockNumber) {
        console.log(
          `Currently at block ${blockNumber}, waiting for block ${expectedBlockNumber} to be confirmed`,
        );

        setActionStep(
          2,
          `Currently at block ${blockNumber}, waiting for block ${expectedBlockNumber} to be confirmed. (${count++} / ${BLOCK_TO_FINALITY})`,
        );

        await sleep(AVG_BLOCK_TIME);
      } else {
        break;
      }
    }

    setActionStep(3);

    const recipient = lockedEvent.returnValues.recipient;

    await hmyMethos.mintToken(
      hmyManager,
      recipient,
      amount,
      lockedEvent.transactionHash,
    );
  } catch (e) {
    console.error(e);

    throw new Error(e.message);
  }
};

export const oneToEthBUSD = async ({
  amount,
  ethUserAddress,
  hmyUserAddress,
  setActionStep,
}) => {
  // user approve eth manager to lock tokens
  try {
    const ethAddrHex = ethUserAddress;
    const hmyAddrHex = hmy.crypto.getAddress(hmyUserAddress).checksum;

    setActionStep(0);

    // user needs to approve hmy manager to burn token
    await hmyMethos.approveHmyManger(busdHmy, hmyManager, amount);

    setActionStep(1);

    // hmy burn tokens, transaction is confirmed instantaneously, no need to wait
    let txHash = await hmyMethos.burnToken(hmyManager, ethAddrHex, amount);

    setActionStep(2);

    await eth.unlockToken(ethAddrHex, amount, txHash);

  } catch (e) {
    console.error(e);

    throw new Error(e.message);
  }
};

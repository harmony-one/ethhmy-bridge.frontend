import * as eth from './eth';
import * as hmyMethos from './hmy';
import { web3 } from '../ethSdk';
import { hmy } from '../sdk';

export const getEthBalanceBUSD = async ethAddress => {
  return await eth.checkEthBalance(process.env.ETH_BUSD_CONTRACT, ethAddress);
};

export const getHmyBalanceBUSD = async hmyAddress => {
  const addrHex = hmy.crypto.getAddress(hmyAddress).checksum;

  return await hmyMethos.checkHmyBalance(
    process.env.HMY_BUSD_CONTRACT,
    addrHex,
  );
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

import { hmy } from './hmy';
import { web3 } from './eth';

export const getBech32Address = address =>
  hmy.crypto.getAddress(address).bech32;

export const getChecksumAddress = address =>
  hmy.crypto.getAddress(address).checksum;

export const getHmyBalance = address => {
  return hmy.blockchain.getBalance({ address });
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
}

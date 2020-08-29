import { hmy } from './index';
import { Wallet } from '@harmony-js/account';

export const options1 = { gasPrice: '0x3B9ACA00' };

export const options = { gasPrice: 1000000000, gasLimit: 6721900 };

export const options2 = { gasPrice: 1000000000, gasLimit: 21000 };

export const ONE = '000000000000000000';

export type TConnectToOneWallet = (
  wallet: Wallet | any,
  addr: string,
  reject: (reason: string) => void,
) => Promise<any>;

export const connectToOneWallet: TConnectToOneWallet = async (
  wallet,
  addrHex,
  reject,
) => {
  let userAddress = addrHex;

  if (!userAddress) {
    // @ts-ignore
    let { address } = await window.onewallet.getAccount();

    userAddress = hmy.crypto.getAddress(address).checksum;
  }

  wallet.defaultSigner = userAddress;

  wallet.signTransaction = async tx => {
    try {
      tx.from = userAddress;

      // @ts-ignore
      const signTx = await window.onewallet.signTransaction(tx);

      return signTx;
    } catch (e) {
      reject(e);
    }

    return null;
  };
};

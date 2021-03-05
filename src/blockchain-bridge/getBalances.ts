import { hmy } from './hmy';

export const getBech32Address = address =>
  hmy.crypto.getAddress(address).bech32;

export const getChecksumAddress = address =>
  hmy.crypto.getAddress(address).checksum;

export const getHmyBalance = address => {
  return hmy.blockchain.getBalance({ address });
};

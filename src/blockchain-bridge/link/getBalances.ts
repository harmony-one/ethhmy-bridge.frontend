import * as hmyMethos from './hmy';
import * as ethMethods from './eth';
import { hmy } from '../sdk';

export const getEthBalanceLINK = async ethAddress => {
  return await ethMethods.checkEthBalance(process.env.ETH_LINK_CONTRACT, ethAddress);
};

export const getHmyBalanceLINK = async hmyAddress => {
  const addrHex = hmy.crypto.getAddress(hmyAddress).checksum;

  return await hmyMethos.checkHmyBalance(
    process.env.HMY_LINK_CONTRACT,
    addrHex,
  );
};

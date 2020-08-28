import * as hmyMethos from './hmy';
import * as ethMethods from './eth';
import { hmy } from '../sdk';

export const getEthBalanceLINK = async ethAddress => {
  try {
    return await ethMethods.checkEthBalance(
      process.env.ETH_LINK_CONTRACT,
      ethAddress,
    );
  } catch (e) {
    console.error(e);
    return 0;
  }
};

export const getHmyBalanceLINK = async hmyAddress => {
  const addrHex = hmy.crypto.getAddress(hmyAddress).checksum;

  return await hmyMethos.checkHmyBalance(
    process.env.HMY_LINK_CONTRACT,
    addrHex,
  );
};

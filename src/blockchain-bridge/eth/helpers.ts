import * as agent from 'superagent';
import Web3 from 'web3';
import { divDecimals, mulDecimals } from '../../utils';
import { web3 } from './index';

const BN = require('bn.js');

export const getGasPrice = async (web3: Web3) => {
  const gasPrice = new BN(await web3.eth.getGasPrice()).mul(new BN(1));

  let gasPriceApi = 0;

  try {
    const info = await agent.get(`https://www.etherchain.org/api/gasPriceOracle`);

    gasPriceApi = mulDecimals(info.body.standard, 8);
  } catch (e) {
    console.error('Error get gas price');
  }

  return gasPrice.lt(gasPriceApi) ? gasPriceApi : gasPrice;
};

export const getNetworkFee = async gas_amount => {
  const gasPrice = await getGasPrice(web3);
  const gasLimit = new BN(gas_amount);

  const fee = gasLimit.mul(gasPrice);

  return Number(divDecimals(fee, 18));
};

export const ethToWei = (amount: string | number) => mulDecimals(amount, 18);

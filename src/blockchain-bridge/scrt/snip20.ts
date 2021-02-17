import { ExecuteResult, SigningCosmWasmClient } from 'secretjs';
import { divDecimals, unlockToken } from '../../utils';

export const Snip20SwapHash = (params: { tx_id: string; address: string }): string => {
  return `${params.tx_id}|${params.address}`;
};

export interface Snip20TokenInfo {
  name: string;
  symbol: string;
  decimals: number;
  total_supply?: string;
}

export const GetSnip20Params = async (params: {
  secretjs: SigningCosmWasmClient;
  address: string;
}): Promise<Snip20TokenInfo> => {
  const { secretjs, address } = params;

  try {
    const paramsResponse = await secretjs.queryContractSmart(address, { token_info: {} });

    return {
      name: paramsResponse.token_info.name,
      symbol: paramsResponse.token_info.symbol,
      decimals: paramsResponse.token_info.decimals,
      total_supply: paramsResponse.token_info?.total_supply,
    };
  } catch (e) {
    throw Error('Failed to get info');
  }
};

export const Snip20GetBalance = async (params: {
  secretjs: SigningCosmWasmClient;
  token: string;
  address: string;
  key: string;
}) => {
  const { secretjs, address, token, key } = params;

  let balanceResponse;
  try {
    balanceResponse = await secretjs.queryContractSmart(token, {
      balance: {
        address: address,
        key,
      },
    });
  } catch (e) {
    console.log(e);
    return unlockToken;
  }

  if (balanceResponse.viewing_key_error) {
    return 'Fix Unlock';
  }

  if (Number(balanceResponse.balance.amount) === 0) {
    return '0';
  }
  return balanceResponse.balance.amount;
};

export const Snip20SendToBridge = async (params: {
  secretjs: SigningCosmWasmClient;
  address: string;
  amount: string;
  msg: string;
  recipient?: string;
}): Promise<string> => {
  const tx = await Snip20Send({
    recipient: params.recipient || process.env.SCRT_SWAP_CONTRACT,
    ...params,
  });

  const txIdKvp = tx.logs[0].events[1].attributes.find(kv => kv.key === 'tx_id');

  let tx_id: string;
  if (txIdKvp && txIdKvp.value) {
    tx_id = txIdKvp.value;
  } else {
    throw new Error('Failed to get tx_id');
  }

  return tx_id;
};

export const Snip20Send = async (params: {
  secretjs: SigningCosmWasmClient;
  address: string;
  amount: string;
  msg: string;
  recipient: string;
}): Promise<ExecuteResult> => {
  const { secretjs, address, amount, msg, recipient } = params;

  return await secretjs.execute(address, {
    send: {
      amount,
      recipient,
      msg,
    },
  });
};

export const GetContractCodeHash = async (params: {
  secretjs: SigningCosmWasmClient;
  address: string;
}): Promise<string> => {
  const { secretjs, address } = params;

  return await secretjs.getCodeHashByContractAddr(address);
};

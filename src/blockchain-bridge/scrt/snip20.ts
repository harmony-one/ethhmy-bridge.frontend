import { ExecuteResult, SigningCosmWasmClient } from 'secretjs';
import { divDecimals, unlockToken } from '../../utils';

export const Snip20SwapHash = (params: { tx_id: string, address: string }): string => {
  return `${params.tx_id}|${params.address}`;
}


export const Snip20GetBalance = async (params: { secretjs: SigningCosmWasmClient, token: string, address: string, key: string, decimals: number }) => {

  const {secretjs, address, token, key, decimals } = params;

  let balanceResponse;
  try {
    balanceResponse = await secretjs.queryContractSmart(token, {
      balance: {
        address: address,
        key,
      },
    });
  } catch (e) {
    console.log(e)
    return unlockToken;
  }

  if (balanceResponse.viewing_key_error) {
    return 'Fix Unlock';
  }

  if (Number(balanceResponse.balance.amount) === 0) {
    return '0';
  }
  return divDecimals(
    balanceResponse.balance.amount,
    decimals,
  );
}

export const Snip20SendToBridge = async (params: { secretjs: SigningCosmWasmClient, address: string, amount: string, msg: string, recipient?: string }): Promise<string> => {
  const tx = await Snip20Send({recipient: params.recipient || process.env.SCRT_SWAP_CONTRACT, ...params});

  const txIdKvp = tx.logs[0].events[1].attributes.find(
    kv => kv.key === 'tx_id',
  );

  let tx_id: string;
  if (txIdKvp && txIdKvp.value) {
    tx_id = txIdKvp.value;
  } else {
    throw new Error("Failed to get tx_id")
  }

  return tx_id
}

export const Snip20Send = async (params: { secretjs: SigningCosmWasmClient, address: string, amount: string, msg: string, recipient: string }): Promise<ExecuteResult> => {

  const {secretjs, address, amount, msg, recipient } = params;

  return await secretjs.execute(
    address,
    {
      send: {
        amount,
        recipient,
        msg,
      },
    },
  );

}

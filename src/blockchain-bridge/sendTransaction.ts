import { HarmonyAddress } from '@harmony-js/crypto';
import { Unit } from '@harmony-js/utils';
import { hmy, options2 } from './sdk';

export const sendTx = async (amount, from, to) => {
  let txnHash;

  try {
    const txn = hmy.transactions.newTx({
      from: new HarmonyAddress(from).checksum,
      to: new HarmonyAddress(to).checksum,
      value: Unit.Szabo(amount).toWei(),
      shardID: 0,
      toShardID: 0,
      gasLimit: options2.gasLimit,
      gasPrice: options2.gasPrice,
    });

    // @ts-ignore
    const signedTxn = await window.onewallet.signTransaction(txn);

    const rez = await signedTxn.sendTransaction();

    const sentTxn = rez[0];
    txnHash = rez[1];

    const confiremdTxn = await sentTxn.confirm(txnHash, 5);
    if (confiremdTxn.isConfirmed()) {
      return { txhash: txnHash };
    } else {
      return {
        error: true,
        txhash: txnHash,
        message: 'The transaction is still not confirmed after 5 attempts.',
      };
    }
  } catch (error) {
    return {
      error: true,
      txhash: txnHash,
      message: 'The transaction is still not confirmed after 5 attempts.',
    };
  }
};

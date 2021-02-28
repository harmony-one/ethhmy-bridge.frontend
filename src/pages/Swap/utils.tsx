import BigNumber from 'bignumber.js';
import { UserStoreEx } from 'stores/UserStore';
import React from 'react';
import Style from 'style-it';
import { humanizeBalance } from '../../utils';
import { ExecuteResult, SigningCosmWasmClient } from 'secretjs';

export const ERROR_WRONG_VIEWING_KEY = 'Viewing Key Error';

export async function getNativeBalance(walletAddress: string, secretjs: SigningCosmWasmClient) {
  return secretjs.getAccount(walletAddress).then(account => {
    try {
      return new BigNumber(account.balance[0].amount);
    } catch (error) {
      return new BigNumber(0);
    }
  });
}

export const unlockJsx = (props: { onClick: any }) =>
  Style.it(
    `.view-token-button {
      cursor: pointer;
      border-radius: 30px;
      padding: 0 0.6em 0 0.3em;
      border: solid;
      border-width: thin;
      border-color: whitesmoke;
    }

    .view-token-button:hover {
      background: whitesmoke;
    }`,
    <span role="img" aria-label={'view'} className="view-token-button" onClick={props.onClick}>
      🔍 View
    </span>,
  );

export const wrongViewingKey = <strong style={{ color: 'red' }}>Wrong Viewing Key</strong>;

export async function getTokenBalance(
  walletAddress: string,
  tokenAddress: string,
  viewingKey: string,
  userStore: UserStoreEx,
): Promise<BigNumber | JSX.Element> {
  if (!viewingKey) {
    return unlockJsx({
      onClick: async e => {
        await userStore.keplrWallet.suggestToken(userStore.chainId, tokenAddress);
        // TODO trigger balance refresh if this was an "advanced set" that didn't
        // result in an on-chain transaction
      },
    });
  }

  // todo: replace this with the function from blockchain-bridge/scrt/snip20
  const result = await userStore.secretjs.queryContractSmart(tokenAddress, {
    balance: {
      address: walletAddress,
      key: viewingKey,
    },
  });

  if (viewingKey && 'viewing_key_error' in result) {
    // TODO handle this
    return (
      <strong
        style={{
          marginLeft: '0.2em',
          color: 'red',
        }}
      >
        {ERROR_WRONG_VIEWING_KEY}
      </strong>
    );
  }

  try {
    return new BigNumber(result.balance.amount);
  } catch (error) {
    console.log(
      `Got an error while trying to query token ${tokenAddress} balance for address ${walletAddress}:`,
      result,
      error,
    );
    return unlockJsx({
      onClick: async e => {
        await userStore.keplrWallet.suggestToken(userStore.chainId, tokenAddress);
        // TODO trigger balance refresh if this was an "advanced set" that didn't
        // result in an on-chain transaction
      },
    });
  }
}

export function compareNormalize(
  number1: BigNumber.Value,
  number2: { amount: BigNumber.Value; decimals: number },
): boolean {
  return humanizeBalance(new BigNumber(number2.amount as any), number2.decimals).isLessThan(new BigNumber(number1));
}

export function storeTxResultLocally(txResult: ExecuteResult) {
  if (!localStorage || !localStorage.setItem || !txResult.transactionHash) {
    return;
  }
  const result = { data: Array.from(txResult.data), logs: txResult.logs };
  localStorage.setItem(txResult.transactionHash, JSON.stringify(result));
}

export const shareOfPoolNumberFormat = new Intl.NumberFormat('en', {
  maximumFractionDigits: 10,
});

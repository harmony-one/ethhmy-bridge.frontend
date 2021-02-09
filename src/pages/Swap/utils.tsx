import BigNumber from 'bignumber.js';
import { ExecuteResult } from 'secretjs';
import { StdFee } from 'secretjs/types/types';
import { UserStoreEx } from 'stores/UserStore';
import { ERROR_WRONG_VIEWING_KEY, TokenDisplay } from '.';
import React from 'react';
import Style from 'style-it';

export async function getBalance(
  symbol: string,
  walletAddress: string,
  tokens: {
    [symbol: string]: TokenDisplay;
  },
  viewingKey: string,
  userStore: UserStoreEx,
): Promise<BigNumber | JSX.Element> {
  if (symbol === 'SCRT') {
    return userStore.secretjs.getAccount(walletAddress).then(account => {
      try {
        return new BigNumber(account.balance[0].amount);
      } catch (error) {
        return new BigNumber(0);
      }
    });
  }

  const unlockJsx = Style.it(
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
    <span
      className="view-token-button"
      onClick={async e => {
        await userStore.keplrWallet.suggestToken(
          userStore.chainId,
          tokens[symbol].address,
        );
        // TODO trigger balance refresh if this was an "advanced set" that didn't
        // result in an on-chain transaction
      }}
    >
      🔍 View
    </span>,
  );

  if (!viewingKey) {
    return unlockJsx;
  }

  const result = await userStore.secretjs.queryContractSmart(
    tokens[symbol].address,
    {
      balance: {
        address: walletAddress,
        key: viewingKey,
      },
    },
  );

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
      `Got an error while trying to query ${symbol} token balance for address ${walletAddress}:`,
      result,
      error,
    );
    return unlockJsx;
  }
}

export function extractValueFromLogs(
  txResult: ExecuteResult,
  key: string,
): string {
  return txResult.logs[0].events
    .find(e => e.type === 'wasm')
    .attributes.find(a => a.key === key).value;
}

export function getFeeForExecute(gas: number): StdFee {
  return {
    amount: [{ amount: String(gas), denom: 'uscrt' }],
    gas: String(gas),
  };
}

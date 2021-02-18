import BigNumber from 'bignumber.js';
import React from 'react';
import Loader from 'react-loader-spinner';
import { displayHumanizedBalance, humanizeBalance } from 'utils';
import { TokenDisplay } from '.';
import { Image } from 'semantic-ui-react';
import preloadedTokens from './tokens.json';
import { SwapTokenMap } from './types/SwapToken';

export const WalletOverview: React.FC<{
  tokens: SwapTokenMap;
  balances: { [symbol: string]: BigNumber | JSX.Element };
}> = ({ tokens, balances }) => {
  const walletTokens = Object.assign({}, tokens, { SCRT: preloadedTokens['SCRT'] });
  const tokenSymbols = Object.keys(walletTokens);

  if (tokenSymbols.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '1em 0' }}>
        <Loader type="ThreeDots" color="#00BFFF" height="0.5em" />
      </div>
    );
  }

  return (
    <>
      {tokenSymbols
        .sort(a => (a.toLowerCase().includes('scrt') ? -1 : 1))
        .map(symbol => {
          const token = walletTokens[symbol];
          const balance = balances[symbol];

          if (!balance) {
            return { token, balance: <Loader type="ThreeDots" color="#00BFFF" height="1em" width="1em" /> };
          }

          const balanceNum = new BigNumber(balances[symbol] as BigNumber);
          if (balanceNum.isNaN()) {
            return { token, balance: balances[symbol] };
          }

          return {
            token,
            balance: (
              <span>
                {displayHumanizedBalance(humanizeBalance(balanceNum, token.decimals), null, token.decimals)}{' '}
                {token.symbol}
              </span>
            ),
          };
        })
        .map(({ token, balance }: { token: TokenDisplay; balance: JSX.Element }) => {
          return (
            <div key={token.symbol} style={{ display: 'flex', alignItems: 'center', marginTop: '1em' }}>
              <Image src={token.logo} avatar style={{ boxShadow: 'rgba(0, 0, 0, 0.075) 0px 6px 10px' }} />
              <span style={{ marginRight: '0.3em' }} />
              {balance}
            </div>
          );
        })}
    </>
  );
};

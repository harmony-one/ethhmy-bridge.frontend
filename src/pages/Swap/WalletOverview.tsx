import BigNumber from 'bignumber.js';
import React from 'react';
import Loader from 'react-loader-spinner';
import { displayHumanizedBalance, humanizeBalance } from 'utils';
import { TokenDisplay } from '.';
import { Image } from 'semantic-ui-react';

export const WalletOverview: React.FC<{
  tokens: { [symbol: string]: TokenDisplay };
  balances: { [symbol: string]: BigNumber | JSX.Element };
}> = ({ tokens, balances }) => {
  return (
    <>
      {Object.keys(tokens)
        .sort((a, b) => (a.toLowerCase().includes('scrt') ? -1 : 1))
        .map(symbol => {
          const token = tokens[symbol];
          const balance = balances[symbol];

          if (!balance) {
            return [token, <Loader type="ThreeDots" color="#00BFFF" height="1em" width="1em" />];
          }

          const balanceNum = new BigNumber(balances[symbol] as BigNumber);
          if (balanceNum.isNaN()) {
            return [token, balances[symbol]];
          }

          return [
            token,
            <span>
              {displayHumanizedBalance(humanizeBalance(balanceNum, token.decimals), null, token.decimals)}{' '}
              {token.symbol}
            </span>,
          ];
        })
        .map(([token, balance]: [TokenDisplay, JSX.Element]) => {
          return (
            <div key={token.symbol} style={{ display: 'flex', alignItems: 'center', marginTop: '1em' }}>
              <Image src={token.logo} avatar />
              <span style={{ marginRight: '0.3em' }} />
              {balance}
            </div>
          );
        })}
    </>
  );
};

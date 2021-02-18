import BigNumber from 'bignumber.js';
import React from 'react';
import Loader from 'react-loader-spinner';
import { displayHumanizedBalance, humanizeBalance } from 'utils';
import { Image } from 'semantic-ui-react';
import { SwapToken, SwapTokenMap } from '../../pages/Swap/types/SwapToken';

export const WalletOverview: React.FC<{
  tokens: SwapTokenMap;
  balances: { [symbol: string]: BigNumber | JSX.Element };
}> = ({ tokens, balances }) => {
  // const tokenSymbols = Object.keys(walletTokens);
  const tokenAddresses = Array.from(tokens.keys());
  if (tokenAddresses.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '1em 0' }}>
        <Loader type="ThreeDots" color="#00BFFF" height="0.5em" />
      </div>
    );
  }

  return (
    <>
      {tokenAddresses
        .sort(a => (a.toLowerCase().includes('scrt') ? -1 : 1))
        .filter(address => balances[address])
        .map(address => {
          const token = tokens.get(address);
          const balance = balances[address];

          // if (!balance) {
          //   return { token, balance: <Loader type="ThreeDots" color="#00BFFF" height="1em" width="1em" /> };
          // }

          const balanceNum = new BigNumber(balances[address] as BigNumber);
          if (balanceNum.isNaN()) {
            return { token, balance: balances[address] };
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
        .map(({ token, balance }: { token: SwapToken; balance: JSX.Element }) => {
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

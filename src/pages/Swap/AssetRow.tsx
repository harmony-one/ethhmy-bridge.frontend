import BigNumber from 'bignumber.js';
import React, { useState } from 'react';
import { displayHumanizedBalance, humanizeBalance } from 'utils';
import { Button, Container, Input, Dropdown, Modal } from 'semantic-ui-react';
import { TokenDisplay } from '.';
import Loader from 'react-loader-spinner';
import { TokenSelector } from './TokenSelector';
import { SwapInput } from '../../components/Swap/SwapInput';
import { SigningCosmWasmClient } from 'secretjs';

const flexRowSpace = <span style={{ flex: 1 }}></span>;

export const AssetRow = ({
  tokens,
  token,
  setToken,
  amount,
  setAmount,
  isEstimated,
  balance,
  label,
  maxButton,
  secretjs,
}: {
  tokens: {
    [symbol: string]: TokenDisplay;
  };
  token: string;
  setToken: (symbol: string) => void;
  amount: string;
  setAmount: (amount: string) => void;
  isEstimated: boolean;
  balance: BigNumber | JSX.Element;
  label: string;
  maxButton: boolean;
  secretjs: SigningCosmWasmClient;
}) => {
  const font = {
    fontWeight: 500,
    fontSize: '14px',
    color: 'rgb(86, 90, 105)',
  };

  return (
    <Container
      style={{
        padding: '1rem',
        borderRadius: '20px',
        border: '1px solid rgb(247, 248, 250)',
        backgroundColor: 'white',
      }}
    >
      <div
        style={{
          display: 'flex',
        }}
      >
        <span style={font}>
          {label}
          {isEstimated ? ` (estimated)` : null}
        </span>
        {flexRowSpace}
        <>
          {'Balance: '}
          {(() => {
            if (balance === undefined) {
              return (
                <>
                  <span style={{ marginRight: '0.5em' }} />
                  <Loader type="ThreeDots" color="#00BFFF" height="1em" width="1em" style={{ margin: 'auto' }} />
                </>
              );
            }

            if (JSON.stringify(balance).includes('View')) {
              return balance;
            }

            return displayHumanizedBalance(
              humanizeBalance(new BigNumber(balance as BigNumber), tokens[token].decimals),
              BigNumber.ROUND_DOWN,
            );
          })()}
        </>
      </div>
      <div
        style={{
          display: 'flex',
        }}
      >
        <SwapInput
          value={amount}
          setValue={value => {
            if (isNaN(Number(value))) {
              return;
            }
            setAmount(value);
          }}
        />
        {flexRowSpace}
        {maxButton && token && (
          <Button
            basic
            color={'blue'}
            disabled={new BigNumber(balance as any).isNaN()}
            style={{
              margin: 'auto',
              borderRadius: '15px',
              fontSize: '1rem',
              fontWeight: 500,
              height: '24px',
              padding: '0rem 0.4rem',
            }}
            onClick={() => {
              const { decimals } = tokens[token];

              setAmount(humanizeBalance(new BigNumber(balance as any), decimals).toFixed(decimals));
            }}
          >
            MAX
          </Button>
        )}
        <TokenSelector
          secretjs={secretjs}
          tokens={Object.values(tokens)}
          token={token ? tokens[token] : undefined}
          onClick={token => {
            setToken(token);
          }}
        />
      </div>
    </Container>
  );
};

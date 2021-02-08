import React, { useState } from 'react';
import { Button, Container, Input, Dropdown, Modal } from 'semantic-ui-react';
import { TokenDisplay } from '.';
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
  balance: number | JSX.Element;
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
          flexDirection: 'row',
        }}
      >
        <span style={font}>
          {label}
          {isEstimated ? ` (estimated)` : null}
        </span>
        {flexRowSpace}
        {(() => {
          if (balance === undefined) {
            return '-';
          }

          const nf = new Intl.NumberFormat('en-US', {
            maximumFractionDigits: Math.min(tokens[token].decimals, 6),
            useGrouping: true,
          });

          return (
            <>
              {'Balance: '}
              {isNaN(Number(balance)) ? balance : nf.format(Number(balance))}
            </>
          );
        })()}
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
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
            primary
            disabled={isNaN(Number(balance))}
            style={{
              borderRadius: '15px',
              fontSize: '1rem',
              fontWeight: 500,
              height: '30px',
              padding: '0rem 0.4rem',
            }}
            onClick={() => setAmount(String(balance))}
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

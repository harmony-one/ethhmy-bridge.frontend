import BigNumber from 'bignumber.js';
import React, { useState } from 'react';
import { Button, Container, Input, Dropdown } from 'semantic-ui-react';
import { displayHumanizedBalance, humanizeBalance } from 'utils';
import { TokenDisplay } from '.';
import Loader from 'react-loader-spinner';

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
}) => {
  const [dropdownBackground, setDropdownBackground] = useState<string>();

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
            if (balance == undefined) {
              return (
                <>
                  <span style={{ marginRight: '0.5em' }} />
                  <Loader
                    type="ThreeDots"
                    color="#00BFFF"
                    height="1em"
                    width="1em"
                    style={{ margin: 'auto' }}
                  />
                </>
              );
            }

            if (JSON.stringify(balance).includes('View')) {
              return balance;
            }

            return displayHumanizedBalance(
              humanizeBalance(
                new BigNumber(balance as BigNumber),
                tokens[token].decimals,
              ),
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
        <Input
          style={{
            padding: 0,
            width: '180px',
          }}
          transparent
          size="massive"
          placeholder="0.0"
          value={amount}
          onChange={(_, { value }: { value: string }) => {
            if (isNaN(Number(value))) {
              return;
            }
            setAmount(value);
          }}
        />
        {flexRowSpace}
        {maxButton && (
          <Button
            primary
            disabled={new BigNumber(balance as any).isNaN()}
            style={{
              borderRadius: '15px',
              fontSize: '1rem',
              fontWeight: 500,
              height: '30px',
              padding: '0rem 0.4rem',
            }}
            onClick={() => {
              const { decimals } = tokens[token];

              setAmount(
                humanizeBalance(
                  new BigNumber(balance as any),
                  decimals,
                ).toFixed(decimals),
              );
            }}
          >
            MAX
          </Button>
        )}
        <Dropdown
          style={{
            border: 'none',
            borderRadius: '15px',
            background: dropdownBackground,
            padding: 1,
          }}
          onMouseEnter={() => setDropdownBackground('whitesmoke')}
          onMouseLeave={() => setDropdownBackground(undefined)}
          options={Object.values(tokens).map(
            (t: { symbol: string; logo: string }) => ({
              key: t.symbol,
              text: t.symbol,
              value: t.symbol,
              image: {
                src: t.logo,
                style: {
                  boxShadow: 'rgba(0, 0, 0, 0.075) 0px 6px 10px',
                  borderRadius: '24px',
                },
              },
            }),
          )}
          value={token}
          onChange={(_, { value }: { value: string }) => setToken(value)}
        />
      </div>
    </Container>
  );
};

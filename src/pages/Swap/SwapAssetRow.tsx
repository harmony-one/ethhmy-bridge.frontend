import React, { useEffect, useState } from 'react';
import { Button, Container, Input, Dropdown } from 'semantic-ui-react';

const flexRowSpace = <span style={{ flex: 1 }}></span>;

const balanceNumberFormat = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 6,
  useGrouping: true,
});

export const SwapAssetRow = ({
  tokens,
  token,
  setToken,
  amount,
  setAmount,
  isEstimated,
  balance,
  isFrom,
}) => {
  const [dropdownBackground, setDropdownBackground] = useState<string>(
    undefined,
  );
  const [myBalance, setMyBalance] = useState<string>(balance);

  const font = {
    fontWeight: 500,
    fontSize: '14px',
    color: 'rgb(86, 90, 105)',
  };

  useEffect(() => {
    setMyBalance(balance);
  }, [balance]);

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
          {isFrom ? 'From' : 'To'}
          {isEstimated ? ` (estimated)` : null}
        </span>
        {flexRowSpace}
        {(() => {
          if (myBalance == undefined) {
            return '-';
          }

          return (
            <>
              {'Balance: '}
              {isNaN(Number(myBalance))
                ? myBalance
                : balanceNumberFormat.format(Number(myBalance))}
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
        <Input
          style={{
            padding: 0,
            width: '180px',
          }}
          transparent
          size="massive"
          placeholder="0.0"
          value={amount}
          onChange={(_, { value }) => {
            if (isNaN(Number(value))) {
              return;
            }
            setAmount(value);
          }}
        />
        {flexRowSpace}
        {isFrom && (
          <Button
            primary
            disabled={isNaN(Number(myBalance))}
            style={{
              borderRadius: '15px',
              fontSize: '1rem',
              fontWeight: 500,
              height: '30px',
              padding: '0rem 0.4rem',
            }}
            onClick={() => setAmount(myBalance)}
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
          onChange={(_, { value }) => setToken(value)}
        />
      </div>
    </Container>
  );
};

import React, { useEffect, useState } from 'react';
import { Icon } from 'semantic-ui-react';

const priceNumberFormat = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 10,
  useGrouping: true,
});

const flexRowSpace = <span style={{ flex: 1 }}></span>;

export const PriceRow = ({ price, fromToken, toToken }) => {
  const [tokens, setTokens] = useState({
    from: fromToken,
    to: toToken,
    price: priceNumberFormat.format(price),
    priceInvert: priceNumberFormat.format(1 / price), // prevents price distortion by multiple clicks
  });
  const [iconBackground, setIconBackground] = useState('whitesmoke');

  useEffect(() => {
    setTokens({
      from: fromToken,
      to: toToken,
      price: priceNumberFormat.format(price),
      priceInvert: priceNumberFormat.format(1 / price), // prevents price distortion by multiple clicks
    });
  }, [fromToken, toToken, price]);

  return (
    <div
      style={{
        padding: '1rem',
        display: 'flex',
        flexDirection: 'row',
        alignContent: 'center',
      }}
    >
      {!tokens.price || Number(tokens.price) === 0 ? null : (
        <>
          {' '}
          Price
          {flexRowSpace}
          {`${tokens.price} ${tokens.from} per ${tokens.to}`}
          <Icon
            circular
            size="small"
            name="exchange"
            style={{
              margin: '0 0 0 0.3em',
              background: iconBackground,
              cursor: 'pointer',
            }}
            onMouseEnter={() => setIconBackground('rgb(237, 238, 242)')}
            onMouseLeave={() => setIconBackground('whitesmoke')}
            onClick={() => {
              setTokens({
                from: tokens.to,
                to: tokens.from,
                price: tokens.priceInvert,
                priceInvert: tokens.price, // prevents price distortion by multiple clicks
              });
            }}
          />
        </>
      )}
    </div>
  );
};

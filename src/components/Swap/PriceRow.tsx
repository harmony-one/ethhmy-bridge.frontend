import React, { useEffect, useState } from 'react';
import { Icon } from 'semantic-ui-react';
import { FlexRowSpace } from './FlexRowSpace';

const numberFormat = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 6,
  useGrouping: true,
});

export const PriceRow = ({
  price,
  fromToken,
  toToken,
  labelPrefix,
}: {
  price: number;
  fromToken: string;
  toToken: string;
  labelPrefix?: string;
}) => {
  const [tokens, setTokens] = useState({
    from: fromToken,
    to: toToken,
    price: numberFormat.format(price),
    priceInvert: numberFormat.format(1 / price), // prevents price distortion from multiple clicks
  });
  const [iconBackground, setIconBackground] = useState('whitesmoke');

  useEffect(() => {
    setTokens({
      from: fromToken,
      to: toToken,
      price: numberFormat.format(price),
      priceInvert: numberFormat.format(1 / price), // prevents price distortion from multiple clicks
    });
  }, [fromToken, toToken, price]);

  return (
    <>
      <div
        style={{
          padding: '1em 0 0 0',
          display: 'flex',
          alignContent: 'center',
        }}
      >
        {labelPrefix}Price
        <FlexRowSpace />
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
              priceInvert: tokens.price, // prevents price distortion from multiple clicks
            });
          }}
        />
      </div>
    </>
  );
};

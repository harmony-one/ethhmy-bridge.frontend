import React, { useState } from 'react';
import { Container, Popup, Icon } from 'semantic-ui-react';
import { formatWithSixDecimals } from '../../utils';

const flexRowSpace = <span style={{ flex: 1 }}></span>;
const additionaInfoNumberFormat = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 12,
  useGrouping: true,
});

export const AdditionalInfo = ({
  minimumReceived,
  maximumSold,
  liquidityProviderFee,
  priceImpact,
  fromToken,
  toToken,
}: {
  minimumReceived?: number;
  maximumSold?: number;
  liquidityProviderFee: number;
  priceImpact: number;
  fromToken: string;
  toToken: string;
}) => {
  const [
    minimumReceivedIconBackground,
    setMinimumreceivedIconBackground,
  ] = useState('whitesmoke');
  const [
    liquidityProviderFeeIconBackground,
    setLiquidityProviderFeeIconBackground,
  ] = useState('whitesmoke');
  const [priceImpactIconBackground, setPriceImpactIconBackground] = useState(
    'whitesmoke',
  );

  let priceImpactColor = 'green'; // Less than 1% - Awesome
  if (priceImpact > 0.05) {
    priceImpactColor = 'red'; // High
  } else if (priceImpact > 0.03) {
    priceImpactColor = 'orange'; // Medium
  } else if (priceImpact > 0.01) {
    priceImpactColor = 'black'; // Low
  }

  return (
    <div style={{ maxWidth: '400px', minWidth: '400px' }}>
      <Container
        style={{
          marginTop: '-2rem',
          borderBottomLeftRadius: '20px',
          borderBottomRightRadius: '20px',
          backgroundColor: 'rgba(255, 255, 255, 0.6)',
          padding: 'calc(16px + 2rem) 2rem 2rem 2rem',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            paddingTop: '0.2rem',
          }}
        >
          <span>
            {minimumReceived !== null ? 'Minimum received' : 'Maximum sold'}
            <Popup
              trigger={
                <Icon
                  name="help"
                  circular
                  size="tiny"
                  style={{
                    marginLeft: '0.5rem',
                    background: minimumReceivedIconBackground,
                  }}
                  onMouseEnter={() =>
                    setMinimumreceivedIconBackground('rgb(237, 238, 242)')
                  }
                  onMouseLeave={() =>
                    setMinimumreceivedIconBackground('whitesmoke')
                  }
                />
              }
              content="Your transaction will revert if there is a large, unfavorable price movement before it is confirmed."
              position="top center"
            />
          </span>
          {flexRowSpace}
          <strong>
            {minimumReceived !== null
              ? `${additionaInfoNumberFormat.format(
                  minimumReceived,
                )} ${toToken}`
              : `${additionaInfoNumberFormat.format(maximumSold)} ${fromToken}`}
          </strong>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            paddingTop: '0.2rem',
          }}
        >
          <span>
            Price Impact
            <Popup
              trigger={
                <Icon
                  name="help"
                  circular
                  size="tiny"
                  style={{
                    marginLeft: '0.5rem',
                    background: priceImpactIconBackground,
                  }}
                  onMouseEnter={() =>
                    setPriceImpactIconBackground('rgb(237, 238, 242)')
                  }
                  onMouseLeave={() =>
                    setPriceImpactIconBackground('whitesmoke')
                  }
                />
              }
              content="The difference between the market price and estimated price due to trade size."
              position="top center"
            />
          </span>
          {flexRowSpace}
          <strong style={{ color: priceImpactColor }}>{`${(
            priceImpact * 100
          ).toFixed(2)}%`}</strong>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            paddingTop: '0.2rem',
          }}
        >
          <span>
            Liquidity Provider Fee
            <Popup
              trigger={
                <Icon
                  name="help"
                  circular
                  size="tiny"
                  style={{
                    marginLeft: '0.5rem',
                    background: liquidityProviderFeeIconBackground,
                  }}
                  onMouseEnter={() =>
                    setLiquidityProviderFeeIconBackground('rgb(237, 238, 242)')
                  }
                  onMouseLeave={() =>
                    setLiquidityProviderFeeIconBackground('whitesmoke')
                  }
                />
              }
              content="A portion of each trade (0.30%) goes to liquidity providers as a protocol incentive."
              position="top center"
            />
          </span>
          {flexRowSpace}
          <strong>
            {additionaInfoNumberFormat.format(liquidityProviderFee)} {fromToken}
          </strong>
        </div>
      </Container>
    </div>
  );
};

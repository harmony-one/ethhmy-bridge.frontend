import BigNumber from 'bignumber.js';
import React, { useState } from 'react';
import { Container, Popup, Icon } from 'semantic-ui-react';
import { PairAnalyticsLink } from '../../components/Swap/PairAnalyticsLink';

export const AdditionalInfo = ({
  minimumReceived,
  maximumSold,
  liquidityProviderFee,
  priceImpact,
  fromToken,
  toToken,
  pairAddress,
}: {
  minimumReceived?: BigNumber;
  maximumSold?: BigNumber;
  liquidityProviderFee: number;
  priceImpact: number;
  fromToken: string;
  toToken: string;
  pairAddress: string;
}) => {
  const [minReceivedIconBackground, setMinReceivedIconBackground] = useState<string>('whitesmoke');
  const [liqProvFeeIconBackground, setLiqProvFeeIconBackground] = useState<string>('whitesmoke');
  const [priceImpactIconBackground, setPriceImpactIconBackground] = useState<string>('whitesmoke');

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
          padding: 'calc(16px + 2rem) 2rem 1rem 2rem',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            paddingTop: '0.2rem',
          }}
        >
          <span>
            {minimumReceived !== null ? 'Minimum Received' : 'Maximum Sold'}
            <Popup
              trigger={
                <Icon
                  name="help"
                  circular
                  size="tiny"
                  style={{
                    marginLeft: '0.5rem',
                    background: minReceivedIconBackground,
                    verticalAlign: 'middle',
                  }}
                  onMouseEnter={() => setMinReceivedIconBackground('rgb(237, 238, 242)')}
                  onMouseLeave={() => setMinReceivedIconBackground('whitesmoke')}
                />
              }
              content="Your transaction will revert if there is a large, unfavorable price movement before it is confirmed."
              position="top center"
            />
          </span>
          <strong>
            {minimumReceived !== null
              ? `${minimumReceived.toFormat(6)} ${toToken}`
              : `${maximumSold.toFormat(6)} ${fromToken}`}
          </strong>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
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
                    verticalAlign: 'middle',
                  }}
                  onMouseEnter={() => setPriceImpactIconBackground('rgb(237, 238, 242)')}
                  onMouseLeave={() => setPriceImpactIconBackground('whitesmoke')}
                />
              }
              content="The difference between the market price and estimated price due to trade size."
              position="top center"
            />
          </span>
          <strong style={{ color: priceImpactColor }}>{`${
            priceImpact < 0.01 / 100
              ? '<0.01'
              : new Intl.NumberFormat('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                  useGrouping: true,
                }).format(priceImpact * 100)
          }%`}</strong>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
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
                    background: liqProvFeeIconBackground,
                    verticalAlign: 'middle',
                  }}
                  onMouseEnter={() => setLiqProvFeeIconBackground('rgb(237, 238, 242)')}
                  onMouseLeave={() => setLiqProvFeeIconBackground('whitesmoke')}
                />
              }
              content="A portion of each trade (0.30%) goes to liquidity providers as a protocol incentive."
              position="top center"
            />
          </span>
          <strong>
            {new Intl.NumberFormat('en-US', {
              maximumFractionDigits: 6,
              useGrouping: true,
            }).format(liquidityProviderFee)}{' '}
            {fromToken}
          </strong>
        </div>
        <PairAnalyticsLink pairAddress={pairAddress} />
      </Container>
    </div>
  );
};

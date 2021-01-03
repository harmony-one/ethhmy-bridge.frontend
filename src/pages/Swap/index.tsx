import React, { useEffect, useState } from 'react';
import { Box } from 'grommet';
import * as styles from '../FAQ/faq-styles.styl';
import { PageContainer } from 'components/PageContainer';
import { BaseContainer } from 'components/BaseContainer';
import {
  Button,
  Container,
  Input,
  Dropdown,
  Icon,
  Popup,
} from 'semantic-ui-react';
import { useStores } from 'stores';
import tokens from './tokens.json';
import './override.css';

const flexRowSpace = <span style={{ flex: 1 }}></span>;
const downArrow = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#00ADE8"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <polyline points="19 12 12 19 5 12"></polyline>
  </svg>
);

const tokenShadow = 'rgba(0, 0, 0, 0.075) 0px 6px 10px';

const FromRow = ({
  fromToken,
  setFromToken,
  fromAmount,
  setFromAmount,
  isEstimated,
}) => {
  const [balance, setBalance] = useState(0);
  const [dropdownBackground, setDropdownBackground] = useState(undefined);

  const font = { fontWeight: 500, fontSize: '14px', color: 'rgb(86, 90, 105)' };

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
        <span style={font}>From{isEstimated ? ` (estimated)` : null}</span>
        {flexRowSpace}
        <span
          style={Object.assign({ cursor: 'pointer' }, font)}
          onClick={() => {}}
        >
          Secret Balance: {balanceNumberFormat.format(balance)}
        </span>
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
          value={fromAmount}
          onChange={(_, { value }) => {
            if (isNaN(Number(value))) {
              return;
            }
            setFromAmount(value);
          }}
        />
        {flexRowSpace}
        <Button
          primary
          style={{
            borderRadius: '15px',
            fontSize: '1rem',
            fontWeight: 500,
            height: '30px',
            padding: '0rem 0.3rem',
          }}
        >
          MAX
        </Button>
        <Dropdown
          style={{
            border: 'none',
            borderRadius: '15px',
            background: dropdownBackground,
          }}
          onMouseEnter={() => setDropdownBackground('whitesmoke')}
          onMouseLeave={() => setDropdownBackground(undefined)}
          options={Object.values(tokens).map(t => ({
            key: t.symbol,
            text: t.symbol,
            value: t.symbol,
            image: {
              src: t.logo,
              style: { boxShadow: tokenShadow, borderRadius: '24px' },
            },
          }))}
          value={fromToken}
          onChange={(_, { value }) => setFromToken(value)}
        />
      </div>
    </Container>
  );
};

const ToRow = ({ toToken, setToToken, toAmount, setToAmount, isEstimated }) => {
  const [balance, setBalance] = useState(0);
  const [dropdownBackground, setDropdownBackground] = useState(undefined);

  const font = { fontWeight: 500, fontSize: '14px', color: 'rgb(86, 90, 105)' };

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
        <span style={font}>To{isEstimated ? ` (estimated)` : null}</span>
        {flexRowSpace}
        <span
          style={Object.assign({ cursor: 'pointer' }, font)}
          onClick={() => {}}
        >
          Secret Balance: {balanceNumberFormat.format(balance)}
        </span>{' '}
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
          value={toAmount}
          onChange={(_, { value }) => {
            if (isNaN(Number(value))) {
              return;
            }
            setToAmount(value);
          }}
        />
        {flexRowSpace}
        <Dropdown
          style={{
            border: 'none',
            borderRadius: '15px',
            background: dropdownBackground,
          }}
          onMouseEnter={() => setDropdownBackground('whitesmoke')}
          onMouseLeave={() => setDropdownBackground(undefined)}
          options={Object.values(tokens).map(t => ({
            key: t.symbol,
            text: t.symbol,
            value: t.symbol,
            image: {
              src: t.logo,
              style: { boxShadow: tokenShadow, borderRadius: '24px' },
            },
          }))}
          value={toToken}
          onChange={(_, { value }) => setToToken(value)}
        />
      </div>
    </Container>
  );
};

const priceNumberFormat = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 10,
  useGrouping: true,
});
const balanceNumberFormat = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 6,
  useGrouping: true,
});
const inputNumberFormat = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 20,
  useGrouping: false,
});

const PriceRow = ({ price, fromToken, toToken }) => {
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
    </div>
  );
};

const AdditionalDetails = ({
  minimumReceived,
  liquidityProviderFee,
  priceImpact,
  fromToken,
  toToken,
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
            Minimum received
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
            {minimumReceived} {toToken}
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
          <strong>{`${priceImpact * 100}%`}</strong>
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
            {balanceNumberFormat.format(liquidityProviderFee)} {fromToken}
          </strong>
        </div>
      </Container>
    </div>
  );
};

export const SwapPage = () => {
  const { user } = useStores();
  const [tokens, setTokens] = useState({ from: 'ETH', to: 'SCRT' });
  const [amounts, setAmounts] = useState({
    from: '',
    to: '',
    isFromEstimated: false,
    isToEstimated: false,
  });
  const [buttonMessage, setButtonMessage] = useState('Enter an amount');
  const [price, SetPrice] = useState(123456); /* TODO */
  const [minimumReceived, SetMinimumReceived] = useState(123456); /* TODO */
  const [priceImpact, SetPriceImpact] = useState(0.02); /* TODO */
  const [liquidityProviderFee, SetLiquidityProviderFee] = useState(
    17.3,
  ); /* TODO */
  const [secretjs, setSecretjs] = useState(null);

  useEffect(() => {
    // Setup Keplr

    (async () => {
      await user.signIn();

      const sleep = ms => new Promise(accept => setTimeout(accept, ms));
      while (!user.secretjs) {
        await sleep(50);
      }
      setSecretjs(user.secretjs);
    })();
  }, []);

  useEffect(() => {
    if (!secretjs) {
      return;
    }

    // Keplr is ready
    (async () => {
      try {
        const response = await secretjs.queryContractSmart(
          process.env.AMM_FACTORY_CONTRACT,
          {
            pairs: {},
          },
        );
        console.log(response);
      } catch (error) {
        console.error(error);
      }
    })();
  }, [secretjs]);

  useEffect(() => {
    // Update buttonMessage
    // TODO: Insufficient liquidity for this trade
    // TODO: Insufficient XXX balance

    if (amounts.from === '' && amounts.to === '') {
      setButtonMessage('Enter an amount');
    } else {
      setButtonMessage('Swap');
    }
  }, [amounts.from, amounts.to]);

  return (
    <BaseContainer>
      <PageContainer>
        <Box
          className={styles.faqContainer}
          pad={{ horizontal: 'large', top: 'large' }}
          style={{ alignItems: 'center' }}
        >
          <Box
            style={{
              maxWidth: '420px',
              minWidth: '420px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
            pad={{ bottom: 'medium' }}
          >
            <Container
              style={{
                zIndex: '10',
                borderRadius: '30px',
                backgroundColor: 'white',
                padding: '2rem',
                boxShadow:
                  'rgba(0, 0, 0, 0.01) 0px 0px 1px, rgba(0, 0, 0, 0.04) 0px 4px 8px, rgba(0, 0, 0, 0.04) 0px 16px 24px, rgba(0, 0, 0, 0.01) 0px 24px 32px',
              }}
            >
              <FromRow
                fromToken={tokens.from}
                setFromToken={(value: string) =>
                  setTokens({ from: value, to: tokens.to })
                }
                fromAmount={amounts.from}
                isEstimated={amounts.isFromEstimated}
                setFromAmount={(value: string) => {
                  if (value === '' || Number(value) === 0) {
                    setAmounts({
                      from: value,
                      isFromEstimated: false,
                      to: '',
                      isToEstimated: false,
                    });
                  } else {
                    setAmounts({
                      from: value,
                      isFromEstimated: false,
                      to: inputNumberFormat.format(Number(value) / price),
                      isToEstimated: true,
                    });
                  }
                }}
              />
              <div
                style={{
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'row',
                  alignContent: 'center',
                }}
              >
                {flexRowSpace}
                <span
                  style={{ cursor: 'pointer' }}
                  onClick={() =>
                    setTokens({ to: tokens.from, from: tokens.to })
                  }
                >
                  {downArrow}
                </span>
                {flexRowSpace}
              </div>
              <ToRow
                toToken={tokens.to}
                setToToken={(value: string) =>
                  setTokens({ to: value, from: tokens.from })
                }
                toAmount={amounts.to}
                isEstimated={amounts.isToEstimated}
                setToAmount={(value: string) => {
                  if (value === '' || Number(value) === 0) {
                    setAmounts({
                      to: value,
                      isToEstimated: false,
                      from: '',
                      isFromEstimated: false,
                    });
                  } else {
                    setAmounts({
                      to: value,
                      isToEstimated: false,
                      from: inputNumberFormat.format(Number(value) * price),
                      isFromEstimated: true,
                    });
                  }
                }}
              />
              <PriceRow
                toToken={tokens.to}
                fromToken={tokens.from}
                price={price}
              />
              <Button
                disabled={buttonMessage !== 'Swap'}
                primary={buttonMessage === 'Swap'}
                fluid
                style={{
                  borderRadius: '12px',
                  padding: '18px',
                  fontSize: '20px',
                }}
              >
                {buttonMessage}
              </Button>
            </Container>
            <AdditionalDetails
              fromToken={tokens.from}
              toToken={tokens.to}
              liquidityProviderFee={liquidityProviderFee}
              priceImpact={priceImpact}
              minimumReceived={minimumReceived}
            />
          </Box>
        </Box>
      </PageContainer>
    </BaseContainer>
  );
};

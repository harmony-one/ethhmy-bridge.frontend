import React, { useEffect, useState } from 'react';
import { Box } from 'grommet';
import * as styles from '../FAQ/faq-styles.styl';
import { PageContainer } from 'components/PageContainer';
import { BaseContainer } from 'components/BaseContainer';
import { Button, Container, Input } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import { useStores } from 'stores';

const flexRowSpace = <span style={{ flex: 1 }}></span>;
const downArrow = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#00ADE8"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <polyline points="19 12 12 19 5 12"></polyline>
  </svg>
);
const boxShadow =
  'rgba(0, 0, 0, 0.01) 0px 0px 1px, rgba(0, 0, 0, 0.04) 0px 4px 8px, rgba(0, 0, 0, 0.04) 0px 16px 24px, rgba(0, 0, 0, 0.01) 0px 24px 32px';

const From = ({ tokens, tokensMap }) => {
  const [fromAmount, setFromAmount] = useState('');
  const [token, setToken] = useState('secretETH');
  const [balance, setBalance] = useState(0);

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
        <span style={font}>From</span>
        {flexRowSpace}
        <span
          style={Object.assign({ cursor: 'pointer' }, font)}
          onClick={() => {}}
        >
          Balance: {balance}
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
          }}
          transparent
          size="massive"
          placeholder="0.0"
          value={fromAmount}
          onChange={(_, { value }) => {
            if (isNaN(Number(value))) {
              return;
            }
            setFromAmount(value.trim());
          }}
        />
        <Button primary>Max</Button>
      </div>
    </Container>
  );
};

const To = ({ tokens, tokensMap }) => {
  const [toAmount, setToAmount] = useState('');
  const [token, setToken] = useState('secretSCRT');
  const [balance, setBalance] = useState(0);

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
        <span style={font}>To</span>
        {flexRowSpace}
        <span
          style={Object.assign({ cursor: 'pointer' }, font)}
          onClick={() => {}}
        >
          Balance: {balance}
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
          }}
          transparent
          size="massive"
          placeholder="0.0"
          value={toAmount}
          onChange={(_, { value }) => {
            if (isNaN(Number(value))) {
              return;
            }
            setToAmount(value.trim());
          }}
        />
      </div>
    </Container>
  );
};

export const SwapPage = () => {
  const { user, tokens } = useStores();
  const [swapTokens, setSwapTokens] = useState([]);
  const [swapTokensMap, setSwapTokensMap] = useState({});

  useEffect(() => {
    (async () => {
      tokens.init();
      await tokens.fetch();
      setSwapTokens(
        tokens.allData
          .map(t => JSON.parse(JSON.stringify(t)))
          .concat({
            dst_address: 'TODO get from somewhere',
            decimals: 6,
            display_props: { symbol: 'SCRT', image: '/scrt.svg' },
          }),
      );
    })();
  }, []);

  useEffect(() => {
    const swapTokensMap = {};
    for (const t of swapTokens) {
      swapTokensMap[t.display_props.symbol] = t;
    }
    setSwapTokensMap(swapTokensMap);
  }, [swapTokens]);

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
              maxWidth: 420,
            }}
            pad={{ bottom: 'medium' }}
          >
            <Container
              style={{
                borderRadius: '30px',
                backgroundColor: 'white',
                padding: '2rem',
                boxShadow: boxShadow,
              }}
            >
              <From tokens={swapTokens} tokensMap={swapTokensMap} />
              <div
                style={{
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'row',
                  alignContent: 'center',
                }}
              >
                {flexRowSpace}
                <span style={{ cursor: 'pointer' }} onClick={() => {}}>
                  {downArrow}
                </span>
                {flexRowSpace}
              </div>
              <To tokens={swapTokens} tokensMap={swapTokensMap} />
            </Container>
          </Box>
        </Box>
      </PageContainer>
    </BaseContainer>
  );
};

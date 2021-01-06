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
import preloadedTokens from './tokens.json';
import './override.css';
import { divDecimals } from 'utils';

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
  tokens,
  fromToken,
  setFromToken,
  fromAmount,
  setFromAmount,
  isEstimated,
  balance,
}) => {
  const [dropdownBackground, setDropdownBackground] = useState(undefined);
  const [myBalance, setMyBalance] = useState(balance);

  const font = { fontWeight: 500, fontSize: '14px', color: 'rgb(86, 90, 105)' };

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
        <span style={font}>From{isEstimated ? ` (estimated)` : null}</span>
        {flexRowSpace}
        {(() => {
          if (myBalance == undefined) {
            return '-';
          }

          const label = `${fromToken === 'SCRT' ? '' : 'Secret '}Balance: `;

          return (
            <>
              {label}
              {isNaN(Number(myBalance))
                ? myBalance
                : balanceNumberFormat.format(myBalance)}
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
          options={Object.values(tokens).map(
            (t: { symbol: string; logo: string }) => ({
              key: t.symbol,
              text: t.symbol,
              value: t.symbol,
              image: {
                src: t.logo,
                style: { boxShadow: tokenShadow, borderRadius: '24px' },
              },
            }),
          )}
          value={fromToken}
          onChange={(_, { value }) => setFromToken(value)}
        />
      </div>
    </Container>
  );
};

const ToRow = ({
  tokens,
  toToken,
  setToToken,
  toAmount,
  setToAmount,
  isEstimated,
  balance,
}) => {
  const [dropdownBackground, setDropdownBackground] = useState(undefined);
  const [myBalance, setMyBalance] = useState(balance);

  const font = { fontWeight: 500, fontSize: '14px', color: 'rgb(86, 90, 105)' };

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
        <span style={font}>To{isEstimated ? ` (estimated)` : null}</span>
        {flexRowSpace}
        {(() => {
          if (myBalance == undefined) {
            return '-';
          }

          const label = `${toToken === 'SCRT' ? '' : 'Secret '}Balance: `;

          return (
            <>
              {label}
              {isNaN(Number(myBalance))
                ? myBalance
                : balanceNumberFormat.format(myBalance)}
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
          options={Object.values(tokens).map(
            (t: { symbol: string; logo: string }) => ({
              key: t.symbol,
              text: t.symbol,
              value: t.symbol,
              image: {
                src: t.logo,
                style: { boxShadow: tokenShadow, borderRadius: '24px' },
              },
            }),
          )}
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

const AdditionalInfo = ({
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
  const [selectedTokens, setSelectedTokens] = useState({
    from: 'ETH',
    to: 'SCRT',
  });
  const [tokens, setTokens] = useState(preloadedTokens);
  const [myBalances, setMyBalances] = useState({});
  const [pairs, setPairs] = useState([]);
  const [symbolsToPairs, setSymbolsToPairs] = useState({});
  const [amounts, setAmounts] = useState({
    from: '',
    to: '',
    isFromEstimated: false,
    isToEstimated: false,
  });
  const [buttonMessage, setButtonMessage] = useState('Enter an amount');
  const [price, setPrice] = useState(null); /* TODO */
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
    // Get pair list from AMM
    (async () => {
      try {
        const pairsResponse = await secretjs.queryContractSmart(
          process.env.AMM_FACTORY_CONTRACT,
          {
            pairs: {},
          },
        );
        setPairs(pairsResponse.pairs);
      } catch (error) {
        console.error(error);
        alert(error);
      }
    })();
  }, [secretjs]);

  useEffect(() => {
    // The pairs list has changed
    // Get tokens from pairs
    (async () => {
      try {
        const newSymbolsToPairs = {};

        const tokensFromPairs = await pairs.reduce(
          async (tokensFromPairs, pair) => {
            tokensFromPairs = await tokensFromPairs; // reduce with async/await

            const symbols = [];
            for (const t of pair.asset_infos) {
              if (t.native_token) {
                tokensFromPairs['SCRT'] = preloadedTokens['SCRT'];
                symbols.push('SCRT');
                continue;
              }

              const tokenInfoResponse = await secretjs.queryContractSmart(
                t.token.contract_addr,
                {
                  token_info: {},
                },
              );

              if (tokensFromPairs[tokenInfoResponse.token_info.symbol]) {
                tokensFromPairs[tokenInfoResponse.token_info.symbol] =
                  tokensFromPairs[tokenInfoResponse.token_info.symbol];
              } else {
                tokensFromPairs[tokenInfoResponse.token_info.symbol] = {
                  symbol: tokenInfoResponse.token_info.symbol,
                  decimals: tokenInfoResponse.token_info.decimals,
                  logo: '/unknown.png',
                  address: t.token.contract_addr,
                  token_code_hash: t.token.token_code_hash,
                };
              }
              symbols.push(tokenInfoResponse.token_info.symbol);
            }
            newSymbolsToPairs[`${symbols[0]}/${symbols[1]}`] = pair;
            newSymbolsToPairs[`${symbols[1]}/${symbols[0]}`] = pair;

            return tokensFromPairs;
          },
          Promise.resolve({}) /* reduce with async/await */,
        );
        setTokens(tokensFromPairs);
        setSymbolsToPairs(newSymbolsToPairs);
      } catch (error) {
        console.error(error);
        alert(error);
      }
    })();
  }, [pairs]);

  useEffect(() => {
    // The token list has changed
    setSelectedTokens({
      from: Object.keys(tokens)[1],
      to: Object.keys(tokens)[0],
    });
  }, [tokens]);

  useEffect(() => {
    // From or To amounts have changed
    // Update buttonMessage
    // TODO: Insufficient liquidity for this trade
    // TODO: Insufficient XXX balance

    if (price === null) {
      setButtonMessage('Trading pair does not exist');
      return;
    }

    if (amounts.from === '' && amounts.to === '') {
      setButtonMessage('Enter an amount');
    } else {
      setButtonMessage('Swap');
    }
  }, [amounts.from, amounts.to, price]);

  useEffect(() => {
    // selectedTokens have changed
    // update price and myBalances
    if (!secretjs) {
      return;
    }

    function getBalance(
      tokenSymbol: string,
      address: string,
      tokens: any,
      viewingKey: string,
    ): Promise<number> {
      if (tokenSymbol === 'SCRT') {
        return secretjs.getAccount(address).then(account => {
          try {
            return Number(
              divDecimals(
                account.balance[0].amount,
                tokens[tokenSymbol].decimals,
              ),
            );
          } catch (error) {
            return 0;
          }
        });
      }

      return secretjs
        .queryContractSmart(tokens[tokenSymbol].address, {
          balance: {
            address: address,
            key: viewingKey,
          },
        })
        .then(({ balance }) =>
          Number(divDecimals(balance.amount, tokens[tokenSymbol].decimals)),
        );
    }

    // update myBalances
    (async () => {
      let fromViewingKey, toViewingKey;
      try {
        fromViewingKey = await user.keplrWallet.getSecret20ViewingKey(
          user.chainId,
          tokens[selectedTokens.from].address,
        );
      } catch (error) {
        console.error(
          `Tried to get viewing key for ${selectedTokens.from}`,
          error,
        );
      }
      try {
        toViewingKey = await user.keplrWallet.getSecret20ViewingKey(
          user.chainId,
          tokens[selectedTokens.to].address,
        );
      } catch (error) {
        console.error(
          `Tried to get viewing key for ${selectedTokens.to}`,
          error,
        );
      }

      const fromBalancePromise = getBalance(
        selectedTokens.from,
        user.address,
        tokens,
        fromViewingKey,
      ).catch(error => {
        console.error(
          `Tried to get my balance for ${selectedTokens.from}`,
          error,
        );
        return (
          <span
            style={{ cursor: 'pointer' }}
            onClick={() => {
              user.keplrWallet.suggestToken(
                user.chainId,
                tokens[selectedTokens.from].address,
              );
            }}
          >
            🔓 Unlock
          </span>
        );
      });
      const toBalancePromise = getBalance(
        selectedTokens.to,
        user.address,
        tokens,
        toViewingKey,
      ).catch(error => {
        console.error(
          `Tried to get my balance for ${selectedTokens.to}`,
          error,
        );
        return (
          <span
            style={{ cursor: 'pointer' }}
            onClick={() => {
              user.keplrWallet.suggestToken(
                user.chainId,
                tokens[selectedTokens.to].address,
              );
            }}
          >
            🔓 Unlock
          </span>
        );
      });

      const [fromBalance, toBalance] = await Promise.all([
        fromBalancePromise,
        toBalancePromise,
      ]);

      setMyBalances(
        Object.assign({}, myBalances, {
          [selectedTokens.from]: fromBalance,
          [selectedTokens.to]: toBalance,
        }),
      );
    })();

    // update price
    (async () => {
      try {
        const pair =
          symbolsToPairs[selectedTokens.from + '/' + selectedTokens.to];

        if (!pair) {
          setPrice(null);
          return;
        }

        const balances = await Promise.all([
          getBalance(
            selectedTokens.from,
            pair.contract_addr,
            tokens,
            'SecretSwap',
          ),
          getBalance(
            selectedTokens.to,
            pair.contract_addr,
            tokens,
            'SecretSwap',
          ),
        ]);

        const newPrice = Number(balances[1]) / Number(balances[0]);
        if (isNaN(newPrice)) {
          setPrice(null);
        } else {
          setPrice(newPrice);
        }
      } catch (error) {
        console.error(error);
        setPrice(null);
      }
    })();
  }, [secretjs, selectedTokens.from, selectedTokens.to]);

  useEffect(() => {
    console.log(myBalances);
  }, [myBalances]);

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
                balance={myBalances[selectedTokens.from]}
                tokens={tokens}
                fromToken={selectedTokens.from}
                setFromToken={(value: string) => {
                  if (value === selectedTokens.to) {
                    // switch
                    setSelectedTokens({ from: value, to: selectedTokens.from });
                  } else {
                    setSelectedTokens({ from: value, to: selectedTokens.to });
                  }
                  setPrice(null);
                }}
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
                  onClick={() => {
                    setSelectedTokens({
                      to: selectedTokens.from,
                      from: selectedTokens.to,
                    });
                    setPrice(null);
                  }}
                >
                  {downArrow}
                </span>
                {flexRowSpace}
              </div>
              <ToRow
                balance={myBalances[selectedTokens.to]}
                tokens={tokens}
                toToken={selectedTokens.to}
                setToToken={(value: string) => {
                  if (value === selectedTokens.from) {
                    // switch
                    setSelectedTokens({ to: value, from: selectedTokens.to });
                  } else {
                    setSelectedTokens({ to: value, from: selectedTokens.from });
                  }
                  setPrice(null);
                }}
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
                toToken={selectedTokens.to}
                fromToken={selectedTokens.from}
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
            {Number(price) > 0 && (
              <AdditionalInfo
                fromToken={selectedTokens.from}
                toToken={selectedTokens.to}
                liquidityProviderFee={liquidityProviderFee}
                priceImpact={priceImpact}
                minimumReceived={minimumReceived}
              />
            )}
          </Box>
        </Box>
      </PageContainer>
    </BaseContainer>
  );
};

import React, { useEffect, useState } from 'react';
import { Box } from 'grommet';
import * as styles from '../FAQ/faq-styles.styl';
import { PageContainer } from 'components/PageContainer';
import { BaseContainer } from 'components/BaseContainer';
import { Button, Container, Icon, Popup } from 'semantic-ui-react';
import { useStores } from 'stores';
import preloadedTokens from './tokens.json';
import './override.css';
import { divDecimals } from 'utils';
import { AssetRow } from './AssetRow';
import { AdditionalInfo } from './AdditionalInfo';
import { PriceRow } from './PriceRow';

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

const inputNumberFormat = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 20,
  useGrouping: false,
});

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
              <AssetRow
                isMaxButton={true}
                balance={myBalances[selectedTokens.from]}
                tokens={tokens}
                token={selectedTokens.from}
                setToken={(value: string) => {
                  if (value === selectedTokens.to) {
                    // switch
                    setSelectedTokens({ from: value, to: selectedTokens.from });
                  } else {
                    setSelectedTokens({ from: value, to: selectedTokens.to });
                  }
                  setPrice(null);
                }}
                amount={amounts.from}
                isEstimated={amounts.isFromEstimated}
                setAmount={(value: string) => {
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
              <AssetRow
                isMaxButton={false}
                balance={myBalances[selectedTokens.to]}
                tokens={tokens}
                token={selectedTokens.to}
                setToken={(value: string) => {
                  if (value === selectedTokens.from) {
                    // switch
                    setSelectedTokens({ to: value, from: selectedTokens.to });
                  } else {
                    setSelectedTokens({ to: value, from: selectedTokens.from });
                  }
                  setPrice(null);
                }}
                amount={amounts.to}
                isEstimated={amounts.isToEstimated}
                setAmount={(value: string) => {
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
                onClick={async () => {
                  const pair =
                    symbolsToPairs[
                      `${selectedTokens.from}/${selectedTokens.to}`
                    ];

                  // secretjs.
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

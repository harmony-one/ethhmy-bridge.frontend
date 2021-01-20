import React, { useEffect, useState } from 'react';
import { Box } from 'grommet';
import * as styles from '../FAQ/faq-styles.styl';
import { PageContainer } from 'components/PageContainer';
import { BaseContainer } from 'components/BaseContainer';
import { Button, Container } from 'semantic-ui-react';
import { useStores } from 'stores';
import preloadedTokens from './tokens.json';
import './override.css';
import { divDecimals, fromToNumberFormat, mulDecimals, sleep } from 'utils';
import { SwapAssetRow } from './SwapAssetRow';
import { AdditionalInfo } from './AdditionalInfo';
import { PriceAndSlippage } from './PriceAndSlippage';
import {
  compute_swap,
  cumpute_offer_amount,
} from '../../blockchain-bridge/scrt/swap';
import { NativeToken, Token, TradeType } from './trade';
import { SigningCosmWasmClient } from 'secretjs';
import Style from 'style-it';
import { UserStoreEx } from 'stores/UserStore';

type Pair = {
  asset_infos: Array<NativeToken | Token>;
  contract_addr: string;
  liquidity_token: string;
  token_code_hash: string;
};

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

type TokenDisplay = {
  symbol: string;
  logo: string;
  decimals: number;
  address?: string;
  token_code_hash?: string;
};

async function getBalance(
  symbol: string,
  walletAddress: string,
  tokens: {
    [symbol: string]: TokenDisplay;
  },
  viewingKey: string,
  userStore: UserStoreEx,
  secretjs: SigningCosmWasmClient,
): Promise<number | JSX.Element> {
  if (symbol === 'SCRT') {
    return secretjs.getAccount(walletAddress).then(account => {
      try {
        return Number(
          divDecimals(account.balance[0].amount, tokens[symbol].decimals),
        );
      } catch (error) {
        return 0;
      }
    });
  }

  const unlockJsx = Style.it(
    `.behold-token {
      cursor: pointer;
      border-radius: 30px;
      padding: 0 0.3em;
      border: solid;
      border-width: thin;
      border-color: whitesmoke;
    }

    .behold-token:hover {
      background: whitesmoke;
    }`,
    <span
      className="behold-token"
      onClick={async () => {
        await userStore.keplrWallet.suggestToken(
          userStore.chainId,
          tokens[symbol].address,
        );
      }}
    >
      🔍 View
    </span>,
  );

  if (!viewingKey) {
    return unlockJsx;
  }

  const result = await secretjs.queryContractSmart(tokens[symbol].address, {
    balance: {
      address: walletAddress,
      key: viewingKey,
    },
  });

  if (viewingKey && 'viewing_key_error' in result) {
    // TODO handle this
    return (
      <strong
        style={{
          marginLeft: '0.2em',
          color: 'red',
        }}
      >
        Wrong viewing key used
      </strong>
    );
  }

  try {
    return Number(divDecimals(result.balance.amount, tokens[symbol].decimals));
  } catch (error) {
    console.log(
      `Got an error while trying to query ${symbol} token balance for address ${walletAddress}:`,
      result,
      error,
    );
    return unlockJsx;
  }
}

export const SwapPage = () => {
  const { user } = useStores();
  const [selectedTokens, setSelectedTokens] = useState<{
    from: string;
    to: string;
  }>({
    from: 'ETH',
    to: 'SCRT',
  });
  const selectedPairSymbol = `${selectedTokens.from}/${selectedTokens.to}`;

  const [tokens, setTokens] = useState<{
    [symbol: string]: TokenDisplay;
  }>({});
  const [balances, setBalances] = useState<{
    [symbol: string]: number | JSX.Element;
  }>({});
  const [pairs, setPairs] = useState<Array<Pair>>([]);
  const [symbolsToPairs, setSymbolsToPairs] = useState<{
    [pairSymbol: string]: Pair;
  }>({});
  const [amounts, setAmounts] = useState<{
    from: string;
    to: string;
    isFromEstimated: boolean;
    isToEstimated: boolean;
    spread: number;
    commission: number;
    priceImpact: number;
  }>({
    from: '',
    to: '',
    isFromEstimated: false,
    isToEstimated: false,
    spread: 0,
    commission: 0,
    priceImpact: 0,
  });
  const [slippageTolerance, setSlippageTolerance] = useState<number>(0.005);
  const [buttonMessage, setButtonMessage] = useState<string>('Enter an amount');
  const [secretjs, setSecretjs] = useState<SigningCosmWasmClient>(null);

  const hidePriceRow: boolean =
    amounts.to === '' ||
    amounts.from === '' ||
    isNaN(Number(amounts.to) / Number(amounts.from)) ||
    buttonMessage === 'Insufficient liquidity for this trade' ||
    buttonMessage === 'Trading pair does not exist';

  useEffect(() => {
    // Setup Keplr
    (async () => {
      await user.signIn();

      while (!user.secretjs) {
        await sleep(100);
      }
      setSecretjs(user.secretjs);
    })();
  }, [user]);

  useEffect(() => {
    if (
      Object.keys(tokens).length === 0 ||
      Object.keys(pairs).length === 0 ||
      Object.keys(symbolsToPairs).length === 0
    ) {
      return () => {};
    }

    // Close the Bridge page ws and open the Swap page
    user.websocketTerminate(true);

    const ws = new WebSocket(process.env.SECRET_WS);

    ws.onmessage = async event => {
      try {
        const data = JSON.parse(event.data);

        const tokenSymbol: string = data.id;

        try {
          const height = Number(data.result.data.value.TxResult.height);
          console.log('Blockchain height', height);
        } catch (error) {
          // Not a tx, just the /subscribe ok event
          // Get balances for the first time...
        }

        let viewingKey: string;
        if (tokenSymbol !== 'SCRT') {
          try {
            viewingKey = await user.keplrWallet.getSecret20ViewingKey(
              user.chainId,
              tokens[tokenSymbol].address,
            );
          } catch (error) {}
        }

        const userBalancePromise = getBalance(
          tokenSymbol,
          user.address,
          tokens,
          viewingKey,
          user,
          secretjs,
        );

        const pairsSymbols = Object.keys(symbolsToPairs).filter(pairSymbol =>
          pairSymbol.startsWith(`${tokenSymbol}/`),
        );
        const pairsBalancesPromises = pairsSymbols.map(pairSymbol =>
          getBalance(
            tokenSymbol,
            symbolsToPairs[pairSymbol].contract_addr,
            tokens,
            'SecretSwap',
            user,
            secretjs,
          ),
        );

        const freshBalances = await Promise.all(
          [userBalancePromise].concat(pairsBalancesPromises),
        );

        const pairSymbolToFreshBalances: {
          [symbol: string]: number | JSX.Element;
        } = {};
        for (let i = 0; i < pairsSymbols.length; i++) {
          const pairSymbol = pairsSymbols[i];
          const [a, b] = pairSymbol.split('/');
          const invertedPairSymbol = `${b}/${a}`;

          pairSymbolToFreshBalances[`${tokenSymbol}-${pairSymbol}`] =
            freshBalances[i + 1];
          pairSymbolToFreshBalances[`${tokenSymbol}-${invertedPairSymbol}`] =
            freshBalances[i + 1];
        }

        setBalances(
          Object.assign(
            balances,
            {
              [tokenSymbol]: freshBalances[0],
            },
            pairSymbolToFreshBalances,
          ),
        );
      } catch (error) {
        console.log(error);
      }
    };

    ws.onopen = async () => {
      while (!user.address) {
        await sleep(100);
      }

      for (const symbol of Object.keys(tokens)) {
        if (symbol === 'SCRT') {
          // Every block => update user and pairs' SCRT balances (this is cheap)
          ws.send(
            JSON.stringify({
              jsonrpc: '2.0',
              id: 'SCRT', // jsonrpc id
              method: 'subscribe',
              params: {
                query: `tm.event='NewBlock'`,
              },
            }),
          );
        } else {
          // Any tx on the token's contract => update user and pairs' token balances
          ws.send(
            JSON.stringify({
              jsonrpc: '2.0',
              id: symbol, // jsonrpc id
              method: 'subscribe',
              params: {
                query: `message.module='compute' AND message.contract_address='${tokens[symbol].address}' AND message.action='execute'`,
              },
            }),
          );
        }
      }
    };

    // Return a cleanup function
    // Once Swap page is unmounted, close Swap page ws and re-open Bridge page ws
    return async () => {
      user.websocketInit();

      if (ws) {
        while (ws.readyState === WebSocket.CONNECTING) {
          await sleep(100);
        }

        if (ws.readyState === WebSocket.OPEN) {
          ws.close(1000 /* Normal Closure */, 'See ya');
        }
      }
    };
  }, [
    user,
    Object.keys(tokens).length > 0,
    Object.keys(pairs).length > 0,
    Object.keys(symbolsToPairs).length > 0,
  ]);

  useEffect(() => {
    if (!secretjs) {
      return;
    }

    // Keplr is ready
    // Get pair list from AMM
    (async () => {
      try {
        const pairsResponse: {
          pairs: Array<Pair>;
        } = await secretjs.queryContractSmart(
          process.env.AMM_FACTORY_CONTRACT,
          {
            pairs: {},
          },
        );
        setPairs(pairsResponse.pairs);
      } catch (error) {
        console.error(error);
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
          async (
            tokensFromPairs: Promise<{
              [symbol: string]: TokenDisplay;
            }>,
            pair: Pair,
          ) => {
            let unwrapedTokensFromPairs: {
              [symbol: string]: TokenDisplay;
            } = await tokensFromPairs; // reduce with async/await

            const symbols = [];
            for (const t of pair.asset_infos) {
              if ('native_token' in t) {
                unwrapedTokensFromPairs['SCRT'] = preloadedTokens['SCRT'];
                symbols.push('SCRT');
                continue;
              }

              const tokenInfoResponse = await secretjs.queryContractSmart(
                t.token.contract_addr,
                {
                  token_info: {},
                },
              );

              const symbol = tokenInfoResponse.token_info.symbol;

              if (!(symbol in unwrapedTokensFromPairs)) {
                unwrapedTokensFromPairs[symbol] = {
                  symbol: symbol,
                  decimals: tokenInfoResponse.token_info.decimals,
                  logo: preloadedTokens[symbol]
                    ? preloadedTokens[symbol].logo
                    : '/unknown.png',
                  address: t.token.contract_addr,
                  token_code_hash: t.token.token_code_hash,
                };
              }
              symbols.push(symbol);
            }
            newSymbolsToPairs[`${symbols[0]}/${symbols[1]}`] = pair;
            newSymbolsToPairs[`${symbols[1]}/${symbols[0]}`] = pair;

            return unwrapedTokensFromPairs;
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
  }, [secretjs, pairs]);

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
    // TODO: Insufficient XXX balance
    // TODO: Price Impact Too High
    if (amounts.from === '' && amounts.to === '') {
      setButtonMessage('Enter an amount');
      return;
    }

    const pair = symbolsToPairs[selectedPairSymbol];
    if (!pair) {
      setButtonMessage('Trading pair does not exist');
      return;
    }

    if (amounts.from === '' || amounts.to === '') {
      setButtonMessage('Wating for price data');
      return;
    }

    if (amounts.priceImpact >= 1 || amounts.priceImpact < 0) {
      setButtonMessage('Insufficient liquidity for this trade');
      return;
    }

    if (amounts.priceImpact >= 0.15) {
      setButtonMessage('Price Impact Too High');
      return;
    }

    setButtonMessage('Swap');
  }, [
    amounts.from,
    amounts.to,
    amounts.priceImpact,
    amounts.spread,
    amounts.commission,
  ]);

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
              <SwapAssetRow
                isFrom={true}
                balance={balances[selectedTokens.from]}
                tokens={tokens}
                token={selectedTokens.from}
                setToken={(value: string) => {
                  if (value === selectedTokens.to) {
                    // switch
                    setSelectedTokens({
                      from: value,
                      to: selectedTokens.from,
                    });
                  } else {
                    setSelectedTokens({
                      from: value,
                      to: selectedTokens.to,
                    });
                  }
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
                      spread: 0,
                      commission: 0,
                      priceImpact: 0,
                    });
                  } else {
                    const {
                      return_amount,
                      spread_amount,
                      commission_amount,
                    } = compute_swap(
                      Number(
                        balances[
                          `${selectedTokens.from}-${selectedPairSymbol}`
                        ],
                      ),
                      Number(
                        balances[`${selectedTokens.to}-${selectedPairSymbol}`],
                      ),
                      Number(value),
                    );

                    if (isNaN(return_amount)) {
                      setAmounts({
                        from: value,
                        isFromEstimated: false,
                        to: '',
                        isToEstimated: false,
                        spread: 0,
                        commission: 0,
                        priceImpact: 0,
                      });
                    } else {
                      setAmounts({
                        from: value,
                        isFromEstimated: false,
                        to:
                          return_amount < 0
                            ? ''
                            : fromToNumberFormat.format(return_amount),
                        isToEstimated: true,
                        spread: spread_amount,
                        commission: commission_amount,
                        priceImpact: spread_amount / return_amount,
                      });
                    }
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

                    if (amounts.isFromEstimated) {
                      const {
                        return_amount,
                        spread_amount,
                        commission_amount,
                      } = compute_swap(
                        Number(
                          balances[
                            `${selectedTokens.to}-${selectedPairSymbol}`
                          ],
                        ),
                        Number(
                          balances[
                            `${selectedTokens.from}-${selectedPairSymbol}`
                          ],
                        ),
                        Number(amounts.to),
                      );

                      if (isNaN(return_amount)) {
                        setAmounts({
                          from: amounts.to,
                          isFromEstimated: false,
                          to: '',
                          isToEstimated: true,
                          spread: 0,
                          commission: 0,
                          priceImpact: 0,
                        });
                      } else {
                        setAmounts({
                          from: amounts.to,
                          isFromEstimated: false,
                          to:
                            return_amount < 0
                              ? ''
                              : fromToNumberFormat.format(return_amount),
                          isToEstimated: true,
                          spread: spread_amount,
                          commission: commission_amount,
                          priceImpact: spread_amount / return_amount,
                        });
                      }
                    } else {
                      const {
                        offer_amount,
                        spread_amount,
                        commission_amount,
                      } = cumpute_offer_amount(
                        Number(
                          balances[
                            `${selectedTokens.to}-${selectedPairSymbol}`
                          ],
                        ),
                        Number(
                          balances[
                            `${selectedTokens.from}-${selectedPairSymbol}`
                          ],
                        ),
                        Number(amounts.from),
                      );

                      if (isNaN(offer_amount)) {
                        setAmounts({
                          to: amounts.from,
                          isToEstimated: false,
                          from: '',
                          isFromEstimated: true,
                          spread: 0,
                          commission: 0,
                          priceImpact: 0,
                        });
                      } else {
                        setAmounts({
                          to: amounts.from,
                          isToEstimated: false,
                          from:
                            offer_amount < 0
                              ? ''
                              : fromToNumberFormat.format(offer_amount),
                          isFromEstimated: true,
                          spread: spread_amount,
                          commission: commission_amount,
                          priceImpact: spread_amount / offer_amount,
                        });
                      }
                    }
                  }}
                >
                  {downArrow}
                </span>
                {flexRowSpace}
              </div>
              <SwapAssetRow
                isFrom={false}
                balance={balances[selectedTokens.to]}
                tokens={tokens}
                token={selectedTokens.to}
                setToken={(value: string) => {
                  if (value === selectedTokens.from) {
                    // switch
                    setSelectedTokens({
                      to: value,
                      from: selectedTokens.to,
                    });
                  } else {
                    setSelectedTokens({
                      to: value,
                      from: selectedTokens.from,
                    });
                  }
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
                      spread: 0,
                      commission: 0,
                      priceImpact: 0,
                    });
                  } else {
                    const {
                      offer_amount,
                      spread_amount,
                      commission_amount,
                    } = cumpute_offer_amount(
                      Number(
                        balances[
                          `${selectedTokens.from}-${selectedPairSymbol}`
                        ],
                      ),
                      Number(
                        balances[`${selectedTokens.to}-${selectedPairSymbol}`],
                      ),
                      Number(value),
                    );

                    if (isNaN(offer_amount)) {
                      setAmounts({
                        to: value,
                        isToEstimated: false,
                        from: '',
                        isFromEstimated: false,
                        spread: 0,
                        commission: 0,
                        priceImpact: 0,
                      });
                    } else {
                      setAmounts({
                        to: value,
                        isToEstimated: false,
                        from:
                          offer_amount < 0
                            ? ''
                            : fromToNumberFormat.format(offer_amount),
                        isFromEstimated: true,
                        spread: spread_amount,
                        commission: commission_amount,
                        priceImpact: spread_amount / offer_amount,
                      });
                    }
                  }
                }}
              />
              {!hidePriceRow && (
                <PriceAndSlippage
                  toToken={selectedTokens.to}
                  fromToken={selectedTokens.from}
                  price={Number(amounts.to) / Number(amounts.from)}
                  slippageTolerance={slippageTolerance}
                />
              )}
              <Button
                disabled={buttonMessage !== 'Swap'}
                primary={buttonMessage === 'Swap'}
                color={buttonMessage === 'Price Impact Too High' ? 'red' : null}
                fluid
                style={{
                  margin: '1em 0 0 0',
                  borderRadius: '12px',
                  padding: '18px',
                  fontSize: '20px',
                }}
                onClick={async () => {
                  const [from, to] = [selectedTokens.from, selectedTokens.to];

                  const pair = symbolsToPairs[`${from}/${to}`];

                  if (from === 'SCRT') {
                    const amountUscrt = mulDecimals(
                      amounts.from,
                      tokens[selectedTokens.from].decimals,
                    ).toString();
                    await secretjs.execute(
                      pair.contract_addr,
                      {
                        swap: {
                          offer_asset: {
                            info: { native_token: { denom: 'uscrt' } },
                            amount: amountUscrt,
                          },
                          /*
                          offer_asset: Asset, // Done
                          belief_price: Option<Decimal>, // TODO
                          max_spread: Option<Decimal>, // TODO
                          to: Option<HumanAddr>, // TODO
                          */
                        },
                      },
                      '',
                      [
                        {
                          amount: amountUscrt,
                          denom: 'uscrt',
                        },
                      ],
                    );
                  } else {
                    const amountInTokenDenom = mulDecimals(
                      amounts.from,
                      tokens[selectedTokens.from].decimals,
                    ).toString();

                    await secretjs.execute(tokens[from].address, {
                      send: {
                        recipient: pair.contract_addr,
                        amount: amountInTokenDenom,
                        msg: btoa(
                          JSON.stringify({
                            swap: {
                              /*
                              belief_price: Option<Decimal>, // TODO
                              max_spread: Option<Decimal>, // TODO
                              to: Option<HumanAddr>, // TODO
                              */
                            },
                          }),
                        ),
                      },
                    });
                  }
                }}
              >
                {buttonMessage}
              </Button>
            </Container>
            {!hidePriceRow && (
              <AdditionalInfo
                fromToken={selectedTokens.from}
                toToken={selectedTokens.to}
                liquidityProviderFee={amounts.commission}
                priceImpact={amounts.priceImpact}
                minimumReceived={
                  amounts.isToEstimated
                    ? Number(amounts.to) * (1 - slippageTolerance)
                    : null
                }
                maximumSold={
                  amounts.isFromEstimated
                    ? Number(amounts.from) * (1 + slippageTolerance)
                    : null
                }
              />
            )}
          </Box>
        </Box>
      </PageContainer>
    </BaseContainer>
  );
};

import React, { useEffect, useState } from 'react';
import { Box } from 'grommet';
import * as styles from '../FAQ/faq-styles.styl';
import { PageContainer } from 'components/PageContainer';
import { BaseContainer } from 'components/BaseContainer';
import { Button, Container } from 'semantic-ui-react';
import { useStores } from 'stores';
import preloadedTokens from './tokens.json';
import './override.css';
import { divDecimals, inputNumberFormat, mulDecimals } from 'utils';
import { SwapAssetRow } from './SwapAssetRow';
import { AdditionalInfo } from './AdditionalInfo';
import { PriceRow } from './PriceRow';
import {
  handleSimulation,
  ReverseSimulateResult,
  ReverseSimulationResponse,
  SimulateResult,
  SimulationReponse,
} from '../../blockchain-bridge/scrt/swap';
import { Currency, Trade, Asset, NativeToken, Token, TradeType } from './trade';
import { SigningCosmWasmClient } from 'secretjs';

type Pair = {
  asset_infos: Array<NativeToken | Token>;
  contract_addr: string;
  liquidity_token: string;
  token_code_hash: string;
};
import { balanceNumberFormat, priceNumberFormat } from '../../utils';

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

export const SwapPage = () => {
  const { user } = useStores();
  const [selectedTokens, setSelectedTokens] = useState<{
    from: string;
    to: string;
  }>({
    from: 'ETH',
    to: 'SCRT',
  });
  const [tokens, setTokens] = useState<{
    [symbol: string]: TokenDisplay;
  }>(preloadedTokens);
  const [myBalances, setMyBalances] = useState({});
  const [pairs, setPairs] = useState<Array<Pair>>([]);
  const [swapDirection, setSwapDirection] = useState<TradeType>(
    TradeType.EXACT_INPUT,
  );
  const [symbolsToPairs, setSymbolsToPairs] = useState({});
  const [amounts, setAmounts] = useState<{
    from: string;
    to: string;
    isFromEstimated: boolean;
    isToEstimated: boolean;
  }>({
    from: '',
    to: '',
    isFromEstimated: false,
    isToEstimated: false,
  });
  const [buttonMessage, setButtonMessage] = useState<string>('Enter an amount');
  const [price, setPrice] = useState<number>(null);
  const [minimumReceived, setMinimumReceived] = useState<number>(0);
  const [priceImpact, setPriceImpact] = useState<number>(0);

  const [liquidityProviderFee, setLiquidityProviderFee] = useState<number>(0);

  const [secretjs, setSecretjs] = useState<SigningCosmWasmClient>(null);

  useEffect(() => {
    (async () => {
      if (!secretjs) {
        setPriceImpact(0);
        return;
      }

      const fromCurrency: Asset = Asset.fromTokenInfo(
        tokens[selectedTokens.from],
      );
      const toCurrency: Asset = Asset.fromTokenInfo(tokens[selectedTokens.to]);

      const trade = new Trade(
        new Currency(fromCurrency, amounts.from),
        new Currency(toCurrency, amounts.to),
        price,
        swapDirection,
      );

      const pair =
        symbolsToPairs[`${selectedTokens.from}/${selectedTokens.to}`]
          .contract_addr;

      const result = await handleSimulation(
        trade,
        secretjs,
        pair,
        swapDirection,
      ).catch(err => console.log(err));

      if (result && Number(result.returned_asset) !== 0) {
        setPriceImpact(
          Number(result.spread_amount) / Number(result.returned_asset),
        );

        setMinimumReceived(Number(trade.getEstimatedAmount()) * 0.995);
        setLiquidityProviderFee(Number(result.commission_amount));
      }
    })();
  }, [
    secretjs,
    selectedTokens.to,
    selectedTokens.from,
    amounts.from,
    amounts.to,
    price,
    tokens,
    symbolsToPairs,
    swapDirection,
  ]);

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
  }, [user]);

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
          async (
            tokensFromPairs: Promise<{
              [symbol: string]: TokenDisplay;
            }>,
            pair,
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

              if (
                unwrapedTokensFromPairs[tokenInfoResponse.token_info.symbol]
              ) {
                unwrapedTokensFromPairs[tokenInfoResponse.token_info.symbol] =
                  unwrapedTokensFromPairs[tokenInfoResponse.token_info.symbol];
              } else {
                unwrapedTokensFromPairs[tokenInfoResponse.token_info.symbol] = {
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
    if (!secretjs || !selectedTokens.from || !selectedTokens.to) {
      return;
    }

    function getBalance(
      tokenSymbol: string,
      walletAddress: string,
      tokens: any,
      viewingKey: string,
    ): Promise<number | JSX.Element> {
      if (tokenSymbol === 'SCRT') {
        return secretjs.getAccount(walletAddress).then(account => {
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

      const unlockJsx = (
        <span
          style={{ cursor: 'pointer' }}
          onClick={async () => {
            await user.keplrWallet.suggestToken(
              user.chainId,
              tokens[tokenSymbol].address,
            );
          }}
        >
          🔓 Unlock
        </span>
      );

      if (!viewingKey) {
        return Promise.resolve(unlockJsx);
      }

      return secretjs
        .queryContractSmart(tokens[tokenSymbol].address, {
          balance: {
            address: walletAddress,
            key: viewingKey,
          },
        })
        .then(result => {
          try {
            return Number(
              divDecimals(result.balance.amount, tokens[tokenSymbol].decimals),
            );
          } catch (error) {
            console.log(
              `Got an error while trying to query ${tokenSymbol} token balance for address ${walletAddress}:`,
              result,
              error,
            );
            return unlockJsx;
          }
        });
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
        console.log(
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
        console.log(`Tried to get viewing key for ${selectedTokens.to}`, error);
      }

      const [fromBalance, toBalance] = await Promise.all([
        getBalance(selectedTokens.from, user.address, tokens, fromViewingKey),
        getBalance(selectedTokens.to, user.address, tokens, toViewingKey),
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
                  setSwapDirection(TradeType.EXACT_INPUT);
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
              <SwapAssetRow
                isFrom={false}
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
                  setSwapDirection(TradeType.EXACT_OUTPUT);
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

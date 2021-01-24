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
import { observer } from 'mobx-react';
import { observable } from 'mobx';

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
        {ERROR_WRONG_VIEWING_KEY}
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

const ERROR_WRONG_VIEWING_KEY = 'Wrong viewing key used';

const BUTTON_MSG_ENTER_AMOUNT = 'Enter an amount';
const BUTTON_MSG_NO_TRADNIG_PAIR = 'Trading pair does not exist';
const BUTTON_MSG_LOADING_PRICE = 'Loading price data';
const BUTTON_MSG_NOT_ENOUGH_LIQUIDITY = 'Insufficient liquidity for this trade';
const BUTTON_MSG_SWAP = 'Swap';

export const SwapPageWrapper = observer(() => {
  // SwapPageWrapper is necessary to get the user store from mobx 🤷‍♂️
  const { user } = useStores();

  return <SwapPage user={user} />;
});

export class SwapPage extends React.Component<
  Readonly<{ user: UserStoreEx }>,
  {
    fromToken: string;
    toToken: string;
    tokens: {
      [symbol: string]: TokenDisplay;
    };
    balances: {
      [symbol: string]: number | JSX.Element;
    };
    pairs: Array<Pair>;
    pairFromSymbol: {
      [symbol: string]: Pair;
    };
    fromInput: string;
    toInput: string;
    isFromEstimated: boolean;
    isToEstimated: boolean;
    spread: number;
    commission: number;
    priceImpact: number;
    slippageTolerance: number;
    buttonMessage: string;
    loadingSwap: boolean;
  }
> {
  constructor(props: Readonly<{ user: UserStoreEx }>) {
    super(props);
    this.user = props.user;
  }

  @observable private user: UserStoreEx;
  private secretjs: SigningCosmWasmClient;
  private ws: WebSocket;
  public state = {
    pairs: [],
    pairFromSymbol: {},
    tokens: {},
    fromToken: '',
    toToken: '',
    balances: {},
    fromInput: '',
    toInput: '',
    isFromEstimated: false,
    isToEstimated: false,
    spread: 0,
    commission: 0,
    priceImpact: 0,
    slippageTolerance: 0.005,
    buttonMessage: BUTTON_MSG_ENTER_AMOUNT,
    loadingSwap: false,
  };
  private symbolUpdateHeightCache: { [symbol: string]: number } = {};

  async componentDidMount() {
    await this.user.signIn();

    while (!this.user.secretjs) {
      await sleep(100);
    }

    this.secretjs = this.user.secretjs;

    const {
      pairs,
    }: {
      pairs: Array<Pair>;
    } = await this.secretjs.queryContractSmart(
      process.env.AMM_FACTORY_CONTRACT,
      {
        pairs: {},
      },
    );

    const pairFromSymbol = {};

    const tokens: {
      [symbol: string]: TokenDisplay;
    } = await pairs.reduce(
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

          const tokenInfoResponse = await this.secretjs.queryContractSmart(
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
        pairFromSymbol[`${symbols[0]}/${symbols[1]}`] = pair;
        pairFromSymbol[`${symbols[1]}/${symbols[0]}`] = pair;

        return unwrapedTokensFromPairs;
      },
      Promise.resolve({}) /* reduce with async/await */,
    );

    const fromToken = Object.keys(tokens)[1];
    const toToken = Object.keys(tokens)[0];

    this.user.websocketTerminate(true);

    this.ws = new WebSocket(process.env.SECRET_WS);

    this.ws.onmessage = async event => {
      try {
        const data = JSON.parse(event.data);

        const symbols: Array<string> = data.id.split('/');

        const heightFromEvent =
          data?.result?.data?.value?.TxResult?.height ||
          data?.result?.data?.value?.block?.header?.height ||
          0;
        const height = Number(heightFromEvent);

        if (isNaN(height)) {
          console.error(
            `height is NaN for some reason. Unexpected behavior from here on out: got heightFromEvent=${heightFromEvent}`,
          );
        }

        console.log(`Refreshing ${symbols.join(' and ')} for height ${height}`);

        for (const tokenSymbol of symbols) {
          if (height <= this.symbolUpdateHeightCache[tokenSymbol]) {
            console.log(`${tokenSymbol} already fresh for height ${height}`);
            return;
          }
          this.symbolUpdateHeightCache[tokenSymbol] = height;

          let viewingKey: string;
          if (tokenSymbol !== 'SCRT') {
            const currentBalance: string = JSON.stringify(
              this.state.balances[tokenSymbol],
            );

            if (
              typeof currentBalance === 'string' &&
              currentBalance.includes(ERROR_WRONG_VIEWING_KEY)
            ) {
              // In case this tx was set_viewing_key in order to correct the wrong viewing key error
              // Allow Keplr time to locally save the new viewing key
              await sleep(1000);
            }

            // Retry getSecret20ViewingKey 3 times
            // Sometimes this event is fired before Keplr stores the viewing key
            let tries = 0;
            while (true) {
              tries += 1;
              try {
                viewingKey = await this.user.keplrWallet.getSecret20ViewingKey(
                  this.user.chainId,
                  tokens[tokenSymbol].address,
                );
              } catch (error) {}
              if (viewingKey || tries === 3) {
                break;
              }
              await sleep(100);
            }
          }

          const userBalancePromise = getBalance(
            tokenSymbol,
            this.user.address,
            tokens,
            viewingKey,
            this.user,
            this.secretjs,
          );

          const pairsSymbols = Object.keys(pairFromSymbol).filter(pairSymbol =>
            pairSymbol.startsWith(`${tokenSymbol}/`),
          );
          const pairsBalancesPromises = pairsSymbols.map(pairSymbol =>
            getBalance(
              tokenSymbol,
              pairFromSymbol[pairSymbol].contract_addr,
              tokens,
              'SecretSwap',
              this.user,
              this.secretjs,
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

          // Using a callbak to setState prevents a race condition
          // where two tokens gets updated after the same block
          // and they start this update with the same this.state.balances
          // (Atomic setState)
          this.setState(currentState => {
            return {
              balances: Object.assign(
                {},
                currentState.balances,
                {
                  [tokenSymbol]: freshBalances[0],
                },
                pairSymbolToFreshBalances,
              ),
            };
          });
        }
      } catch (error) {
        console.log(error);
      }
    };

    this.ws.onopen = async () => {
      // Here we register for token related events
      // Then in onmessage we know when to refresh all the balances
      while (!this.user.address) {
        await sleep(100);
      }

      // Register for token or SCRT events
      for (const symbol of Object.keys(tokens)) {
        if (symbol === 'SCRT') {
          // I sent a tx => I paid for gas
          this.ws.send(
            JSON.stringify({
              jsonrpc: '2.0',
              id: 'SCRT', // jsonrpc id
              method: 'subscribe',
              params: {
                query: `message.sender='${this.user.address}'`,
              },
            }),
          );

          // I received SCRT
          this.ws.send(
            JSON.stringify({
              jsonrpc: '2.0',
              id: 'SCRT', // jsonrpc id
              method: 'subscribe',
              params: {
                query: `transfer.recipient='${this.user.address}'`,
              },
            }),
          );
        } else {
          // Any tx on the token's contract
          const tokenAddress = tokens[symbol].address;

          this.ws.send(
            JSON.stringify({
              jsonrpc: '2.0',
              id: symbol, // jsonrpc id
              method: 'subscribe',
              params: {
                query: `message.contract_address='${tokenAddress}'`,
              },
            }),
          );
          this.ws.send(
            JSON.stringify({
              jsonrpc: '2.0',
              id: symbol, // jsonrpc id
              method: 'subscribe',
              params: {
                query: `wasm.contract_address='${tokenAddress}'`,
              },
            }),
          );
        }
      }

      // Register for pair events
      // Token events aren't enough because of a bug in x/compute
      // See: TODO link to PR
      const uniquePairSymbols: Array<string> = Object.values(
        Object.keys(pairFromSymbol).reduce((symbolFromPair, symbol) => {
          const pair = JSON.stringify(pairFromSymbol[symbol]);
          if (pair in symbolFromPair) {
            return symbolFromPair;
          }

          return Object.assign(symbolFromPair, {
            [pair]: symbol,
          });
        }, {}),
      );

      for (const symbol of uniquePairSymbols) {
        const pairAddress = pairFromSymbol[symbol].contract_addr;

        this.ws.send(
          JSON.stringify({
            jsonrpc: '2.0',
            id: symbol, // jsonrpc id
            method: 'subscribe',
            params: {
              query: `message.contract_address='${pairAddress}'`,
            },
          }),
        );
        this.ws.send(
          JSON.stringify({
            jsonrpc: '2.0',
            id: symbol, // jsonrpc id
            method: 'subscribe',
            params: {
              query: `wasm.contract_address='${pairAddress}'`,
            },
          }),
        );
      }
    };

    this.setState({
      pairs,
      pairFromSymbol,
      tokens,
      fromToken,
      toToken,
    });
  }

  async componentWillUnmount() {
    this.user.websocketInit();

    if (this.ws) {
      while (this.ws.readyState === WebSocket.CONNECTING) {
        await sleep(100);
      }

      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.close(1000 /* Normal Closure */, 'See ya');
      }
    }
  }

  render() {
    const selectedPairSymbol = `${this.state.fromToken}/${this.state.toToken}`;
    const pair = this.state.pairFromSymbol[selectedPairSymbol];

    let buttonMessage: string;
    if (this.state.fromInput === '' && this.state.toInput === '') {
      buttonMessage = BUTTON_MSG_ENTER_AMOUNT;
    } else if (
      Number(this.state.balances[this.state.fromToken]) <
      Number(this.state.fromInput)
    ) {
      buttonMessage = `Insufficient ${this.state.fromToken} balance`;
    } else if (!pair) {
      buttonMessage = BUTTON_MSG_NO_TRADNIG_PAIR;
    } else if (this.state.fromInput === '' || this.state.toInput === '') {
      buttonMessage = BUTTON_MSG_LOADING_PRICE;
    } else if (this.state.priceImpact >= 1 || this.state.priceImpact < 0) {
      buttonMessage = BUTTON_MSG_NOT_ENOUGH_LIQUIDITY;
    } else {
      buttonMessage = BUTTON_MSG_SWAP;
    }

    const hidePriceRow: boolean =
      this.state.toInput === '' ||
      this.state.fromInput === '' ||
      isNaN(Number(this.state.toInput) / Number(this.state.fromInput)) ||
      this.state.buttonMessage === BUTTON_MSG_NOT_ENOUGH_LIQUIDITY ||
      this.state.buttonMessage === BUTTON_MSG_NO_TRADNIG_PAIR;

    const [fromBalance, toBalance] = [
      this.state.balances[this.state.fromToken],
      this.state.balances[this.state.toToken],
    ];

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
                  balance={fromBalance}
                  tokens={this.state.tokens}
                  token={this.state.fromToken}
                  setToken={(value: string) => {
                    if (value === this.state.toToken) {
                      // switch
                      this.setState({
                        fromToken: value,
                        toToken: this.state.fromToken,
                      });
                    } else {
                      this.setState({
                        fromToken: value,
                      });
                    }
                  }}
                  amount={this.state.fromInput}
                  isEstimated={this.state.isFromEstimated}
                  setAmount={(value: string) => {
                    if (value === '' || Number(value) === 0) {
                      this.setState({
                        fromInput: value,
                        isFromEstimated: false,
                        toInput: '',
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
                          this.state.balances[
                            `${this.state.fromToken}-${selectedPairSymbol}`
                          ],
                        ),
                        Number(
                          this.state.balances[
                            `${this.state.toToken}-${selectedPairSymbol}`
                          ],
                        ),
                        Number(value),
                      );

                      if (isNaN(return_amount)) {
                        this.setState({
                          fromInput: value,
                          isFromEstimated: false,
                          toInput: '',
                          isToEstimated: false,
                          spread: 0,
                          commission: 0,
                          priceImpact: 0,
                        });
                      } else {
                        this.setState({
                          fromInput: value,
                          isFromEstimated: false,
                          toInput:
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
                      if (this.state.isFromEstimated) {
                        const {
                          return_amount,
                          spread_amount,
                          commission_amount,
                        } = compute_swap(
                          Number(
                            this.state.balances[
                              `${this.state.toToken}-${selectedPairSymbol}`
                            ],
                          ),
                          Number(
                            this.state.balances[
                              `${this.state.fromToken}-${selectedPairSymbol}`
                            ],
                          ),
                          Number(this.state.toInput),
                        );

                        if (isNaN(return_amount) || this.state.toInput === '') {
                          this.setState({
                            toToken: this.state.fromToken,
                            fromToken: this.state.toToken,
                            fromInput: this.state.toInput,
                            isFromEstimated: false,
                            toInput: '',
                            isToEstimated: false,
                            spread: 0,
                            commission: 0,
                            priceImpact: 0,
                          });
                        } else {
                          this.setState({
                            toToken: this.state.fromToken,
                            fromToken: this.state.toToken,
                            fromInput: this.state.toInput,
                            isFromEstimated: false,
                            toInput:
                              return_amount < 0
                                ? ''
                                : fromToNumberFormat.format(return_amount),
                            isToEstimated: return_amount >= 0,
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
                            this.state.balances[
                              `${this.state.toToken}-${selectedPairSymbol}`
                            ],
                          ),
                          Number(
                            this.state.balances[
                              `${this.state.fromToken}-${selectedPairSymbol}`
                            ],
                          ),
                          Number(this.state.fromInput),
                        );

                        if (
                          isNaN(offer_amount) ||
                          this.state.fromInput === ''
                        ) {
                          this.setState({
                            toToken: this.state.fromToken,
                            fromToken: this.state.toToken,
                            toInput: this.state.fromInput,
                            isToEstimated: false,
                            fromInput: '',
                            isFromEstimated: false,
                            spread: 0,
                            commission: 0,
                            priceImpact: 0,
                          });
                        } else {
                          this.setState({
                            toToken: this.state.fromToken,
                            fromToken: this.state.toToken,
                            toInput: this.state.fromInput,
                            isToEstimated: false,
                            fromInput:
                              offer_amount < 0
                                ? ''
                                : fromToNumberFormat.format(offer_amount),
                            isFromEstimated: offer_amount >= 0,
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
                  balance={toBalance}
                  tokens={this.state.tokens}
                  token={this.state.toToken}
                  setToken={(value: string) => {
                    if (value === this.state.fromToken) {
                      // switch
                      this.setState({
                        toToken: value,
                        fromToken: this.state.toToken,
                      });
                    } else {
                      this.setState({
                        toToken: value,
                      });
                    }
                  }}
                  amount={this.state.toInput}
                  isEstimated={this.state.isToEstimated}
                  setAmount={(value: string) => {
                    if (value === '' || Number(value) === 0) {
                      this.setState({
                        toInput: value,
                        isToEstimated: false,
                        fromInput: '',
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
                          this.state.balances[
                            `${this.state.fromToken}-${selectedPairSymbol}`
                          ],
                        ),
                        Number(
                          this.state.balances[
                            `${this.state.toToken}-${selectedPairSymbol}`
                          ],
                        ),
                        Number(value),
                      );

                      if (isNaN(offer_amount)) {
                        this.setState({
                          toInput: value,
                          isToEstimated: false,
                          fromInput: '',
                          isFromEstimated: false,
                          spread: 0,
                          commission: 0,
                          priceImpact: 0,
                        });
                      } else {
                        this.setState({
                          toInput: value,
                          isToEstimated: false,
                          fromInput:
                            offer_amount < 0
                              ? ''
                              : fromToNumberFormat.format(offer_amount),
                          isFromEstimated: offer_amount >= 0,
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
                    toToken={this.state.toToken}
                    fromToken={this.state.fromToken}
                    price={
                      Number(this.state.toInput) / Number(this.state.fromInput)
                    }
                    slippageTolerance={this.state.slippageTolerance}
                    setSlippageTolerance={slippageTolerance => {
                      this.setState({ slippageTolerance });
                    }}
                  />
                )}
                <Button
                  disabled={
                    buttonMessage !== BUTTON_MSG_SWAP || this.state.loadingSwap
                  }
                  loading={this.state.loadingSwap}
                  primary={buttonMessage === BUTTON_MSG_SWAP}
                  fluid
                  style={{
                    margin: '1em 0 0 0',
                    borderRadius: '12px',
                    padding: '18px',
                    fontSize: '20px',
                  }}
                  onClick={async () => {
                    if (this.state.priceImpact >= 0.15) {
                      const confirmString = 'confirm';
                      const confirm = prompt(
                        `Price impact for this swap is very high. Please type the word "${confirmString}" to continue.`,
                      );
                      if (confirm !== confirmString) {
                        return;
                      }
                    }

                    this.setState({ loadingSwap: true });

                    try {
                      const pair = this.state.pairFromSymbol[
                        `${this.state.fromToken}/${this.state.toToken}`
                      ];

                      if (this.state.fromToken === 'SCRT') {
                        const amountUscrt = mulDecimals(
                          this.state.fromInput,
                          this.state.tokens[this.state.fromToken].decimals,
                        ).toString();
                        await this.secretjs.execute(
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
                          this.state.fromInput,
                          this.state.tokens[this.state.fromToken].decimals,
                        ).toString();

                        await this.secretjs.execute(
                          this.state.tokens[this.state.fromToken].address,
                          {
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
                          },
                        );
                      }
                    } catch (error) {
                      console.error('Swap error', error);
                      this.setState({
                        loadingSwap: false,
                      });
                      return;
                    }

                    this.setState({
                      loadingSwap: false,
                      toInput: '',
                      fromInput: '',
                    });
                  }}
                >
                  {buttonMessage}
                </Button>
              </Container>
              {!hidePriceRow && (
                <AdditionalInfo
                  fromToken={this.state.fromToken}
                  toToken={this.state.toToken}
                  liquidityProviderFee={this.state.commission}
                  priceImpact={this.state.priceImpact}
                  minimumReceived={
                    this.state.isToEstimated
                      ? Number(this.state.toInput) *
                        (1 - this.state.slippageTolerance)
                      : null
                  }
                  maximumSold={
                    this.state.isFromEstimated
                      ? Number(this.state.fromInput) *
                        (1 + this.state.slippageTolerance)
                      : null
                  }
                />
              )}
            </Box>
          </Box>
        </PageContainer>
      </BaseContainer>
    );
  }
}

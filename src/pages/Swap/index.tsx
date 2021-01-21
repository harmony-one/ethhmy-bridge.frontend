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

export const SwapPageWrapper = observer((props: any) => {
  const { user } = useStores();

  return <SwapPage user={user} />;
});

export class SwapPage extends React.Component<
  { user: UserStoreEx },
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
    symbolsToPairs: {
      [pairSymbol: string]: Pair;
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
  }
> {
  constructor(props) {
    super(props);
    this.user = props.user;
  }

  @observable private user: UserStoreEx;
  private secretjs: SigningCosmWasmClient;
  private ws: WebSocket;
  public state = {
    pairs: [], // done
    symbolsToPairs: {}, // done
    tokens: {}, // done
    fromToken: '', // done
    toToken: '', // done
    balances: {}, // done
    fromInput: '',
    toInput: '',
    isFromEstimated: false,
    isToEstimated: false,
    spread: 0,
    commission: 0,
    priceImpact: 0,
    slippageTolerance: 0.005,
    buttonMessage: 'Enter an amount', // done
  };

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

    const symbolsToPairs = {};

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
        symbolsToPairs[`${symbols[0]}/${symbols[1]}`] = pair;
        symbolsToPairs[`${symbols[1]}/${symbols[0]}`] = pair;

        return unwrapedTokensFromPairs;
      },
      Promise.resolve({}) /* reduce with async/await */,
    );

    const fromToken = Object.keys(tokens)[1];
    const toToken = Object.keys(tokens)[0];

    this.user.websocketTerminate(true);

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
            viewingKey = await this.user.keplrWallet.getSecret20ViewingKey(
              this.user.chainId,
              tokens[tokenSymbol].address,
            );
          } catch (error) {}
        }

        const userBalancePromise = getBalance(
          tokenSymbol,
          this.user.address,
          tokens,
          viewingKey,
          this.user,
          this.secretjs,
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

        this.setState({
          balances: Object.assign(
            {},
            this.state.balances,
            {
              [tokenSymbol]: freshBalances[0],
            },
            pairSymbolToFreshBalances,
          ),
        });
      } catch (error) {
        console.log(error);
      }
    };

    ws.onopen = async () => {
      while (!this.user.address) {
        await sleep(100);
      }

      for (const symbol of Object.keys(tokens)) {
        if (symbol === 'SCRT') {
          // Every block => update user and pairs' SCRT balances
          // Assaf: This might be cheaper than subscribing to as many queries as there are pairs
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

    this.setState({
      pairs,
      symbolsToPairs,
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
    const pair = this.state.symbolsToPairs[selectedPairSymbol];

    let buttonMessage;
    // TODO: Insufficient XXX balance
    if (this.state.fromInput === '' && this.state.toInput === '') {
      buttonMessage = 'Enter an amount';
    } else if (!pair) {
      buttonMessage = 'Trading pair does not exist';
    } else if (this.state.fromInput === '' || this.state.toInput === '') {
      buttonMessage = 'Loading price data';
    } else if (this.state.priceImpact >= 1 || this.state.priceImpact < 0) {
      buttonMessage = 'Insufficient liquidity for this trade';
    } else if (this.state.priceImpact >= 0.15) {
      buttonMessage = 'Price Impact Too High';
    } else {
      buttonMessage = 'Swap';
    }

    const hidePriceRow: boolean =
      this.state.toInput === '' ||
      this.state.fromInput === '' ||
      isNaN(Number(this.state.toInput) / Number(this.state.fromInput)) ||
      this.state.buttonMessage === 'Insufficient liquidity for this trade' ||
      this.state.buttonMessage === 'Trading pair does not exist';

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

                        if (isNaN(return_amount)) {
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

                        if (isNaN(offer_amount)) {
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
                  disabled={buttonMessage !== 'Swap'}
                  primary={buttonMessage === 'Swap'}
                  color={
                    buttonMessage === 'Price Impact Too High' ? 'red' : null
                  }
                  fluid
                  style={{
                    margin: '1em 0 0 0',
                    borderRadius: '12px',
                    padding: '18px',
                    fontSize: '20px',
                  }}
                  onClick={async () => {
                    const pair = this.state.symbolsToPairs[
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

// export const SwapPage2 = () => {
//   const { user } = useStores();
//   const [selectedTokens, setSelectedTokens] = useState<{
//     from: string;
//     to: string;
//   }>({
//     from: 'ETH',
//     to: 'SCRT',
//   });
//   const selectedPairSymbol = `${selectedTokens.from}/${selectedTokens.to}`;

//   const [tokens, setTokens] = useState<{
//     [symbol: string]: TokenDisplay;
//   }>({});
//   const [balances, setBalances] = useState<{
//     [symbol: string]: number | JSX.Element;
//   }>({});
//   const [pairs, setPairs] = useState<Array<Pair>>([]);
//   const [symbolsToPairs, setSymbolsToPairs] = useState<{
//     [pairSymbol: string]: Pair;
//   }>({});
//   const [amounts, setAmounts] = useState<{
//     from: string;
//     to: string;
//     isFromEstimated: boolean;
//     isToEstimated: boolean;
//     spread: number;
//     commission: number;
//     priceImpact: number;
//   }>({
//     from: '',
//     to: '',
//     isFromEstimated: false,
//     isToEstimated: false,
//     spread: 0,
//     commission: 0,
//     priceImpact: 0,
//   });
//   const [slippageTolerance, setSlippageTolerance] = useState<number>(0.005);
//   const [buttonMessage, setButtonMessage] = useState<string>('Enter an amount');
//   const [secretjs, setSecretjs] = useState<SigningCosmWasmClient>(null);

//   const hidePriceRow: boolean =
//     amounts.to === '' ||
//     amounts.from === '' ||
//     isNaN(Number(amounts.to) / Number(amounts.from)) ||
//     buttonMessage === 'Insufficient liquidity for this trade' ||
//     buttonMessage === 'Trading pair does not exist';

//   useEffect(() => {
//     // Setup Keplr
//     (async () => {
//       await user.signIn();

//       while (!user.secretjs) {
//         await sleep(100);
//       }
//       setSecretjs(user.secretjs);
//     })();
//   }, [user]);

//   useEffect(() => {
//     if (
//       Object.keys(tokens).length === 0 ||
//       Object.keys(pairs).length === 0 ||
//       Object.keys(symbolsToPairs).length === 0
//     ) {
//       return () => {};
//     }

//     // Close the Bridge page ws and open the Swap page
//     user.websocketTerminate(true);

//     const ws = new WebSocket(process.env.SECRET_WS);

//     ws.onmessage = async event => {
//       try {
//         const data = JSON.parse(event.data);

//         const tokenSymbol: string = data.id;

//         try {
//           const height = Number(data.result.data.value.TxResult.height);
//           console.log('Blockchain height', height);
//         } catch (error) {
//           // Not a tx, just the /subscribe ok event
//           // Get balances for the first time...
//         }

//         let viewingKey: string;
//         if (tokenSymbol !== 'SCRT') {
//           try {
//             viewingKey = await user.keplrWallet.getSecret20ViewingKey(
//               user.chainId,
//               tokens[tokenSymbol].address,
//             );
//           } catch (error) {}
//         }

//         const userBalancePromise = getBalance(
//           tokenSymbol,
//           user.address,
//           tokens,
//           viewingKey,
//           user,
//           secretjs,
//         );

//         const pairsSymbols = Object.keys(symbolsToPairs).filter(pairSymbol =>
//           pairSymbol.startsWith(`${tokenSymbol}/`),
//         );
//         const pairsBalancesPromises = pairsSymbols.map(pairSymbol =>
//           getBalance(
//             tokenSymbol,
//             symbolsToPairs[pairSymbol].contract_addr,
//             tokens,
//             'SecretSwap',
//             user,
//             secretjs,
//           ),
//         );

//         const freshBalances = await Promise.all(
//           [userBalancePromise].concat(pairsBalancesPromises),
//         );

//         const pairSymbolToFreshBalances: {
//           [symbol: string]: number | JSX.Element;
//         } = {};
//         for (let i = 0; i < pairsSymbols.length; i++) {
//           const pairSymbol = pairsSymbols[i];
//           const [a, b] = pairSymbol.split('/');
//           const invertedPairSymbol = `${b}/${a}`;

//           pairSymbolToFreshBalances[`${tokenSymbol}-${pairSymbol}`] =
//             freshBalances[i + 1];
//           pairSymbolToFreshBalances[`${tokenSymbol}-${invertedPairSymbol}`] =
//             freshBalances[i + 1];
//         }

//         setBalances(
//           Object.assign(
//             balances,
//             {
//               [tokenSymbol]: freshBalances[0],
//             },
//             pairSymbolToFreshBalances,
//           ),
//         );
//       } catch (error) {
//         console.log(error);
//       }
//     };

//     ws.onopen = async () => {
//       while (!user.address) {
//         await sleep(100);
//       }

//       for (const symbol of Object.keys(tokens)) {
//         if (symbol === 'SCRT') {
//           // Every block => update user and pairs' SCRT balances (this is cheap)
//           ws.send(
//             JSON.stringify({
//               jsonrpc: '2.0',
//               id: 'SCRT', // jsonrpc id
//               method: 'subscribe',
//               params: {
//                 query: `tm.event='NewBlock'`,
//               },
//             }),
//           );
//         } else {
//           // Any tx on the token's contract => update user and pairs' token balances
//           ws.send(
//             JSON.stringify({
//               jsonrpc: '2.0',
//               id: symbol, // jsonrpc id
//               method: 'subscribe',
//               params: {
//                 query: `message.module='compute' AND message.contract_address='${tokens[symbol].address}' AND message.action='execute'`,
//               },
//             }),
//           );
//         }
//       }
//     };

//     // Return a cleanup function
//     // Once Swap page is unmounted, close Swap page ws and re-open Bridge page ws
//     return async () => {
//       user.websocketInit();

//       if (ws) {
//         while (ws.readyState === WebSocket.CONNECTING) {
//           await sleep(100);
//         }

//         if (ws.readyState === WebSocket.OPEN) {
//           ws.close(1000 /* Normal Closure */, 'See ya');
//         }
//       }
//     };
//   }, [
//     user,
//     Object.keys(tokens).length > 0,
//     Object.keys(pairs).length > 0,
//     Object.keys(symbolsToPairs).length > 0,
//   ]);

//   useEffect(() => {
//     if (!secretjs) {
//       return;
//     }

//     // Keplr is ready
//     // Get pair list from AMM
//     (async () => {
//       try {
//         const pairsResponse: {
//           pairs: Array<Pair>;
//         } = await secretjs.queryContractSmart(
//           process.env.AMM_FACTORY_CONTRACT,
//           {
//             pairs: {},
//           },
//         );
//         setPairs(pairsResponse.pairs);
//       } catch (error) {
//         console.error(error);
//       }
//     })();
//   }, [secretjs]);

//   useEffect(() => {
//     // The pairs list has changed
//     // Get tokens from pairs
//     (async () => {
//       try {
//         const newSymbolsToPairs = {};

//         const tokensFromPairs = await pairs.reduce(
//           async (
//             tokensFromPairs: Promise<{
//               [symbol: string]: TokenDisplay;
//             }>,
//             pair: Pair,
//           ) => {
//             let unwrapedTokensFromPairs: {
//               [symbol: string]: TokenDisplay;
//             } = await tokensFromPairs; // reduce with async/await

//             const symbols = [];
//             for (const t of pair.asset_infos) {
//               if ('native_token' in t) {
//                 unwrapedTokensFromPairs['SCRT'] = preloadedTokens['SCRT'];
//                 symbols.push('SCRT');
//                 continue;
//               }

//               const tokenInfoResponse = await secretjs.queryContractSmart(
//                 t.token.contract_addr,
//                 {
//                   token_info: {},
//                 },
//               );

//               const symbol = tokenInfoResponse.token_info.symbol;

//               if (!(symbol in unwrapedTokensFromPairs)) {
//                 unwrapedTokensFromPairs[symbol] = {
//                   symbol: symbol,
//                   decimals: tokenInfoResponse.token_info.decimals,
//                   logo: preloadedTokens[symbol]
//                     ? preloadedTokens[symbol].logo
//                     : '/unknown.png',
//                   address: t.token.contract_addr,
//                   token_code_hash: t.token.token_code_hash,
//                 };
//               }
//               symbols.push(symbol);
//             }
//             newSymbolsToPairs[`${symbols[0]}/${symbols[1]}`] = pair;
//             newSymbolsToPairs[`${symbols[1]}/${symbols[0]}`] = pair;

//             return unwrapedTokensFromPairs;
//           },
//           Promise.resolve({}) /* reduce with async/await */,
//         );
//         setTokens(tokensFromPairs);
//         setSelectedTokens({
//           from: Object.keys(tokensFromPairs)[1],
//           to: Object.keys(tokensFromPairs)[0],
//         });
//         setSymbolsToPairs(newSymbolsToPairs);
//       } catch (error) {
//         console.error(error);
//         alert(error);
//       }
//     })();
//   }, [secretjs, pairs]);

//   useEffect(() => {
//     // From or To amounts have changed
//     // Update buttonMessage
//     // TODO: Insufficient XXX balance
//     // TODO: Price Impact Too High
//     if (amounts.from === '' && amounts.to === '') {
//       setButtonMessage('Enter an amount');
//       return;
//     }

//     const pair = symbolsToPairs[selectedPairSymbol];
//     if (!pair) {
//       setButtonMessage('Trading pair does not exist');
//       return;
//     }

//     if (amounts.from === '' || amounts.to === '') {
//       setButtonMessage('Wating for price data');
//       return;
//     }

//     if (amounts.priceImpact >= 1 || amounts.priceImpact < 0) {
//       setButtonMessage('Insufficient liquidity for this trade');
//       return;
//     }

//     if (amounts.priceImpact >= 0.15) {
//       setButtonMessage('Price Impact Too High');
//       return;
//     }

//     setButtonMessage('Swap');
//   }, [
//     amounts.from,
//     amounts.to,
//     amounts.priceImpact,
//     amounts.spread,
//     amounts.commission,
//   ]);

//   const [fromBalance, toBalance] = [
//     balances[selectedTokens.from],
//     balances[selectedTokens.to],
//   ];

//   return (
//     <BaseContainer>
//       <PageContainer>
//         <Box
//           className={styles.faqContainer}
//           pad={{ horizontal: 'large', top: 'large' }}
//           style={{ alignItems: 'center' }}
//         >
//           <Box
//             style={{
//               maxWidth: '420px',
//               minWidth: '420px',
//               display: 'flex',
//               flexDirection: 'column',
//               alignItems: 'center',
//             }}
//             pad={{ bottom: 'medium' }}
//           >
//             <Container
//               style={{
//                 zIndex: '10',
//                 borderRadius: '30px',
//                 backgroundColor: 'white',
//                 padding: '2rem',
//                 boxShadow:
//                   'rgba(0, 0, 0, 0.01) 0px 0px 1px, rgba(0, 0, 0, 0.04) 0px 4px 8px, rgba(0, 0, 0, 0.04) 0px 16px 24px, rgba(0, 0, 0, 0.01) 0px 24px 32px',
//               }}
//             >
//               <SwapAssetRow
//                 isFrom={true}
//                 balance={fromBalance}
//                 tokens={tokens}
//                 token={selectedTokens.from}
//                 setToken={(value: string) => {
//                   if (value === selectedTokens.to) {
//                     // switch
//                     setSelectedTokens({
//                       from: value,
//                       to: selectedTokens.from,
//                     });
//                   } else {
//                     setSelectedTokens({
//                       from: value,
//                       to: selectedTokens.to,
//                     });
//                   }
//                 }}
//                 amount={amounts.from}
//                 isEstimated={amounts.isFromEstimated}
//                 setAmount={(value: string) => {
//                   if (value === '' || Number(value) === 0) {
//                     setAmounts({
//                       from: value,
//                       isFromEstimated: false,
//                       to: '',
//                       isToEstimated: false,
//                       spread: 0,
//                       commission: 0,
//                       priceImpact: 0,
//                     });
//                   } else {
//                     const {
//                       return_amount,
//                       spread_amount,
//                       commission_amount,
//                     } = compute_swap(
//                       Number(
//                         balances[
//                           `${selectedTokens.from}-${selectedPairSymbol}`
//                         ],
//                       ),
//                       Number(
//                         balances[`${selectedTokens.to}-${selectedPairSymbol}`],
//                       ),
//                       Number(value),
//                     );

//                     if (isNaN(return_amount)) {
//                       setAmounts({
//                         from: value,
//                         isFromEstimated: false,
//                         to: '',
//                         isToEstimated: false,
//                         spread: 0,
//                         commission: 0,
//                         priceImpact: 0,
//                       });
//                     } else {
//                       setAmounts({
//                         from: value,
//                         isFromEstimated: false,
//                         to:
//                           return_amount < 0
//                             ? ''
//                             : fromToNumberFormat.format(return_amount),
//                         isToEstimated: true,
//                         spread: spread_amount,
//                         commission: commission_amount,
//                         priceImpact: spread_amount / return_amount,
//                       });
//                     }
//                   }
//                 }}
//               />
//               <div
//                 style={{
//                   padding: '1rem',
//                   display: 'flex',
//                   flexDirection: 'row',
//                   alignContent: 'center',
//                 }}
//               >
//                 {flexRowSpace}
//                 <span
//                   style={{ cursor: 'pointer' }}
//                   onClick={() => {
//                     setSelectedTokens({
//                       to: selectedTokens.from,
//                       from: selectedTokens.to,
//                     });

//                     if (amounts.isFromEstimated) {
//                       const {
//                         return_amount,
//                         spread_amount,
//                         commission_amount,
//                       } = compute_swap(
//                         Number(
//                           balances[
//                             `${selectedTokens.to}-${selectedPairSymbol}`
//                           ],
//                         ),
//                         Number(
//                           balances[
//                             `${selectedTokens.from}-${selectedPairSymbol}`
//                           ],
//                         ),
//                         Number(amounts.to),
//                       );

//                       if (isNaN(return_amount)) {
//                         setAmounts({
//                           from: amounts.to,
//                           isFromEstimated: false,
//                           to: '',
//                           isToEstimated: true,
//                           spread: 0,
//                           commission: 0,
//                           priceImpact: 0,
//                         });
//                       } else {
//                         setAmounts({
//                           from: amounts.to,
//                           isFromEstimated: false,
//                           to:
//                             return_amount < 0
//                               ? ''
//                               : fromToNumberFormat.format(return_amount),
//                           isToEstimated: true,
//                           spread: spread_amount,
//                           commission: commission_amount,
//                           priceImpact: spread_amount / return_amount,
//                         });
//                       }
//                     } else {
//                       const {
//                         offer_amount,
//                         spread_amount,
//                         commission_amount,
//                       } = cumpute_offer_amount(
//                         Number(
//                           balances[
//                             `${selectedTokens.to}-${selectedPairSymbol}`
//                           ],
//                         ),
//                         Number(
//                           balances[
//                             `${selectedTokens.from}-${selectedPairSymbol}`
//                           ],
//                         ),
//                         Number(amounts.from),
//                       );

//                       if (isNaN(offer_amount)) {
//                         setAmounts({
//                           to: amounts.from,
//                           isToEstimated: false,
//                           from: '',
//                           isFromEstimated: true,
//                           spread: 0,
//                           commission: 0,
//                           priceImpact: 0,
//                         });
//                       } else {
//                         setAmounts({
//                           to: amounts.from,
//                           isToEstimated: false,
//                           from:
//                             offer_amount < 0
//                               ? ''
//                               : fromToNumberFormat.format(offer_amount),
//                           isFromEstimated: true,
//                           spread: spread_amount,
//                           commission: commission_amount,
//                           priceImpact: spread_amount / offer_amount,
//                         });
//                       }
//                     }
//                   }}
//                 >
//                   {downArrow}
//                 </span>
//                 {flexRowSpace}
//               </div>
//               <SwapAssetRow
//                 isFrom={false}
//                 balance={toBalance}
//                 tokens={tokens}
//                 token={selectedTokens.to}
//                 setToken={(value: string) => {
//                   if (value === selectedTokens.from) {
//                     // switch
//                     setSelectedTokens({
//                       to: value,
//                       from: selectedTokens.to,
//                     });
//                   } else {
//                     setSelectedTokens({
//                       to: value,
//                       from: selectedTokens.from,
//                     });
//                   }
//                 }}
//                 amount={amounts.to}
//                 isEstimated={amounts.isToEstimated}
//                 setAmount={(value: string) => {
//                   if (value === '' || Number(value) === 0) {
//                     setAmounts({
//                       to: value,
//                       isToEstimated: false,
//                       from: '',
//                       isFromEstimated: false,
//                       spread: 0,
//                       commission: 0,
//                       priceImpact: 0,
//                     });
//                   } else {
//                     const {
//                       offer_amount,
//                       spread_amount,
//                       commission_amount,
//                     } = cumpute_offer_amount(
//                       Number(
//                         balances[
//                           `${selectedTokens.from}-${selectedPairSymbol}`
//                         ],
//                       ),
//                       Number(
//                         balances[`${selectedTokens.to}-${selectedPairSymbol}`],
//                       ),
//                       Number(value),
//                     );

//                     if (isNaN(offer_amount)) {
//                       setAmounts({
//                         to: value,
//                         isToEstimated: false,
//                         from: '',
//                         isFromEstimated: false,
//                         spread: 0,
//                         commission: 0,
//                         priceImpact: 0,
//                       });
//                     } else {
//                       setAmounts({
//                         to: value,
//                         isToEstimated: false,
//                         from:
//                           offer_amount < 0
//                             ? ''
//                             : fromToNumberFormat.format(offer_amount),
//                         isFromEstimated: true,
//                         spread: spread_amount,
//                         commission: commission_amount,
//                         priceImpact: spread_amount / offer_amount,
//                       });
//                     }
//                   }
//                 }}
//               />
//               {!hidePriceRow && (
//                 <PriceAndSlippage
//                   toToken={selectedTokens.to}
//                   fromToken={selectedTokens.from}
//                   price={Number(amounts.to) / Number(amounts.from)}
//                   slippageTolerance={slippageTolerance}
//                 />
//               )}
//               <Button
//                 disabled={buttonMessage !== 'Swap'}
//                 primary={buttonMessage === 'Swap'}
//                 color={buttonMessage === 'Price Impact Too High' ? 'red' : null}
//                 fluid
//                 style={{
//                   margin: '1em 0 0 0',
//                   borderRadius: '12px',
//                   padding: '18px',
//                   fontSize: '20px',
//                 }}
//                 onClick={async () => {
//                   const [from, to] = [selectedTokens.from, selectedTokens.to];

//                   const pair = symbolsToPairs[`${from}/${to}`];

//                   if (from === 'SCRT') {
//                     const amountUscrt = mulDecimals(
//                       amounts.from,
//                       tokens[selectedTokens.from].decimals,
//                     ).toString();
//                     await secretjs.execute(
//                       pair.contract_addr,
//                       {
//                         swap: {
//                           offer_asset: {
//                             info: { native_token: { denom: 'uscrt' } },
//                             amount: amountUscrt,
//                           },
//                           /*
//                           offer_asset: Asset, // Done
//                           belief_price: Option<Decimal>, // TODO
//                           max_spread: Option<Decimal>, // TODO
//                           to: Option<HumanAddr>, // TODO
//                           */
//                         },
//                       },
//                       '',
//                       [
//                         {
//                           amount: amountUscrt,
//                           denom: 'uscrt',
//                         },
//                       ],
//                     );
//                   } else {
//                     const amountInTokenDenom = mulDecimals(
//                       amounts.from,
//                       tokens[selectedTokens.from].decimals,
//                     ).toString();

//                     await secretjs.execute(tokens[from].address, {
//                       send: {
//                         recipient: pair.contract_addr,
//                         amount: amountInTokenDenom,
//                         msg: btoa(
//                           JSON.stringify({
//                             swap: {
//                               /*
//                               belief_price: Option<Decimal>, // TODO
//                               max_spread: Option<Decimal>, // TODO
//                               to: Option<HumanAddr>, // TODO
//                               */
//                             },
//                           }),
//                         ),
//                       },
//                     });
//                   }
//                 }}
//               >
//                 {buttonMessage}
//               </Button>
//             </Container>
//             {!hidePriceRow && (
//               <AdditionalInfo
//                 fromToken={selectedTokens.from}
//                 toToken={selectedTokens.to}
//                 liquidityProviderFee={amounts.commission}
//                 priceImpact={amounts.priceImpact}
//                 minimumReceived={
//                   amounts.isToEstimated
//                     ? Number(amounts.to) * (1 - slippageTolerance)
//                     : null
//                 }
//                 maximumSold={
//                   amounts.isFromEstimated
//                     ? Number(amounts.from) * (1 + slippageTolerance)
//                     : null
//                 }
//               />
//             )}
//           </Box>
//         </Box>
//       </PageContainer>
//     </BaseContainer>
//   );
// };

import React from 'react';
import { Box } from 'grommet';
import * as styles from '../FAQ/faq-styles.styl';
import { PageContainer } from 'components/PageContainer';
import { BaseContainer } from 'components/BaseContainer';
import { useStores } from 'stores';
import './override.css';
import { divDecimals, sleep } from 'utils';
import { NativeToken, Token } from './trade';
import Style from 'style-it';
import { UserStoreEx } from 'stores/UserStore';
import { observer } from 'mobx-react';
import { SwapTab } from './SwapTab';
import { ProvideTab } from './ProvideTab';
import { WithdrawTab } from './WithdrawTab';
import preloadedTokens from './tokens.json';
import { Icon, Message, Popup } from 'semantic-ui-react';

export type Pair = {
  asset_infos: Array<NativeToken | Token>;
  contract_addr: string;
  liquidity_token: string;
  token_code_hash: string;
};

export type TokenDisplay = {
  symbol: string;
  logo: string;
  decimals?: number;
  address?: string;
  token_code_hash?: string;
};

export const ERROR_WRONG_VIEWING_KEY = 'Wrong viewing key used';

export const flexRowSpace = <span style={{ flex: 1 }}></span>;

export const swapContainerStyle = {
  zIndex: '10',
  borderRadius: '30px',
  backgroundColor: 'white',
  padding: '2em',
  boxShadow:
    'rgba(0, 0, 0, 0.01) 0px 0px 1px, rgba(0, 0, 0, 0.04) 0px 4px 8px, rgba(0, 0, 0, 0.04) 0px 16px 24px, rgba(0, 0, 0, 0.01) 0px 24px 32px',
};

export async function getBalance(
  symbol: string,
  walletAddress: string,
  tokens: {
    [symbol: string]: TokenDisplay;
  },
  viewingKey: string,
  userStore: UserStoreEx,
): Promise<number | JSX.Element> {
  if (symbol === 'SCRT') {
    return userStore.secretjs.getAccount(walletAddress).then(account => {
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
    `.view-token-button {
      cursor: pointer;
      border-radius: 30px;
      padding: 0 0.6em 0 0.3em;
      border: solid;
      border-width: thin;
      border-color: whitesmoke;
    }

    .view-token-button:hover {
      background: whitesmoke;
    }`,
    <span
      className="view-token-button"
      onClick={async () => {
        await userStore.keplrWallet.suggestToken(
          userStore.chainId,
          tokens[symbol].address,
        );
        // TODO trigger balance refresh if this was an "advanced set" that didn't
        // result in an on-chain transaction
      }}
    >
      🔍 View
    </span>,
  );

  if (!viewingKey) {
    return unlockJsx;
  }

  const result = await userStore.secretjs.queryContractSmart(
    tokens[symbol].address,
    {
      balance: {
        address: walletAddress,
        key: viewingKey,
      },
    },
  );

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

export const SwapPageWrapper = observer(() => {
  // SwapPageWrapper is necessary to get the user store from mobx 🤷‍♂️
  const { user } = useStores();

  return <SwapRouter user={user} />;
});

export class SwapRouter extends React.Component<
  Readonly<{ user: UserStoreEx }>,
  {
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
    securedByIconBackground: string;
  }
> {
  private symbolUpdateHeightCache: { [symbol: string]: number } = {};
  private ws: WebSocket;
  public state = {
    tokens: {},
    balances: {},
    pairs: [],
    pairFromSymbol: {},
    securedByIconBackground: 'whitesmoke',
  };

  constructor(props: Readonly<{ user: UserStoreEx }>) {
    super(props);
    window.onhashchange = this.onHashChange.bind(this);
  }

  onHashChange() {
    this.forceUpdate();
  }

  async componentDidMount() {
    await this.props.user.signIn(true);

    while (!this.props.user.secretjs) {
      await sleep(100);
    }

    const {
      pairs,
    }: {
      pairs: Array<Pair>;
    } = await this.props.user.secretjs.queryContractSmart(
      process.env.AMM_FACTORY_CONTRACT,
      {
        pairs: {},
      },
    );

    const pairFromSymbol: {
      [symbol: string]: Pair;
    } = {};

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

          const tokenInfoResponse = await this.props.user.secretjs.queryContractSmart(
            t.token.contract_addr,
            {
              token_info: {},
            },
          );

          const symbol = tokenInfoResponse.token_info.symbol;

          const displaySymbol = preloadedTokens[symbol]?.symbol || symbol;
          if (!(symbol in unwrapedTokensFromPairs)) {
            unwrapedTokensFromPairs[displaySymbol] = {
              symbol: displaySymbol,
              decimals: tokenInfoResponse.token_info.decimals,
              logo: preloadedTokens[symbol]
                ? preloadedTokens[symbol].logo
                : '/unknown.png',
              address: t.token.contract_addr,
              token_code_hash: t.token.token_code_hash,
            };
          }
          symbols.push(displaySymbol);
        }
        pairFromSymbol[`${symbols[0]}/${symbols[1]}`] = pair;
        pairFromSymbol[`${symbols[1]}/${symbols[0]}`] = pair;

        return unwrapedTokensFromPairs;
      },
      Promise.resolve({}) /* reduce with async/await */,
    );

    this.props.user.websocketTerminate(true);

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

        const getViewingKey = async (symbol: string, tokenAddress: string) => {
          let viewingKey: string;
          const currentBalance: string = JSON.stringify(
            this.state.balances[symbol],
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
              viewingKey = await this.props.user.keplrWallet.getSecret20ViewingKey(
                this.props.user.chainId,
                tokenAddress,
              );
            } catch (error) {}
            if (viewingKey || tries === 3) {
              break;
            }
            await sleep(100);
          }
          return viewingKey;
        };

        const pairSymbol = data.id;
        const pair = pairFromSymbol[pairSymbol];
        if (pair) {
          console.log('Refresh LP token for', pairSymbol);
          // update my LP token balance
          const lpTokenSymbol = `LP-${pairSymbol}`;
          const viewingKey = await getViewingKey(
            lpTokenSymbol,
            pair.liquidity_token,
          );
          const lpBalance = await getBalance(
            lpTokenSymbol,
            this.props.user.address,
            {
              [lpTokenSymbol]: {
                address: pair.liquidity_token,
                decimals: 6,
                symbol: lpTokenSymbol,
                logo: '',
              },
            },
            viewingKey,
            this.props.user,
          );

          // update LP token total supply
          let lpTotalSupply = 0;
          try {
            const result: {
              token_info: {
                name: string;
                symbol: string;
                decimals: number;
                total_supply: string;
              };
            } = await this.props.user.secretjs.queryContractSmart(
              pair.liquidity_token,
              {
                token_info: {},
              },
            );

            lpTotalSupply = Number(
              divDecimals(result.token_info.total_supply, 6),
            );
          } catch (error) {
            console.error(
              `Error trying to get LP token total supply of ${pairSymbol}`,
              pair,
              error,
            );
          }

          // Using a callbak to setState prevents a race condition
          // where two tokens gets updated after the same block
          // and they start this update with the same this.state.balances
          // (Atomic setState)
          this.setState(currentState => {
            return {
              balances: Object.assign({}, currentState.balances, {
                [lpTokenSymbol]: lpBalance,
                [`${lpTokenSymbol}-total-supply`]: lpTotalSupply,
              }),
            };
          });
        }

        for (const tokenSymbol of symbols) {
          if (height <= this.symbolUpdateHeightCache[tokenSymbol]) {
            console.log(`${tokenSymbol} already fresh for height ${height}`);
            return;
          }
          this.symbolUpdateHeightCache[tokenSymbol] = height;

          let viewingKey: string;
          if (tokenSymbol !== 'SCRT') {
            viewingKey = await getViewingKey(
              tokenSymbol,
              tokens[tokenSymbol].address,
            );
          }

          const userBalancePromise = getBalance(
            tokenSymbol,
            this.props.user.address,
            tokens,
            viewingKey,
            this.props.user,
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
              this.props.user,
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
      while (!this.props.user.address) {
        await sleep(100);
      }

      // Register for token or SCRT events
      for (const tokenSymbol of Object.keys(tokens)) {
        if (tokenSymbol === 'SCRT') {
          const myAddress = this.props.user.address;
          const scrtQueries = [
            `message.sender='${myAddress}'` /* sent a tx (gas) */,
            `message.signer='${myAddress}'` /* executed a contract (gas) */,
            `transfer.recipient='${myAddress}'` /* received SCRT */,
          ];

          for (const query of scrtQueries) {
            this.ws.send(
              JSON.stringify({
                jsonrpc: '2.0',
                id: 'SCRT', // jsonrpc id
                method: 'subscribe',
                params: { query },
              }),
            );
          }
        } else {
          // Any tx on the token's contract
          const tokenAddress = tokens[tokenSymbol].address;
          const tokenQueries = [
            `message.contract_address='${tokenAddress}'`,
            `wasm.contract_address='${tokenAddress}'`,
          ];

          for (const query of tokenQueries) {
            this.ws.send(
              JSON.stringify({
                jsonrpc: '2.0',
                id: tokenSymbol, // jsonrpc id
                method: 'subscribe',
                params: { query },
              }),
            );
          }
        }
      }

      // Register for pair events
      // Token events aren't enough because of a bug in x/compute (x/wasmd)
      // See: https://github.com/CosmWasm/wasmd/pull/386
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

      for (const pairSymbol of uniquePairSymbols) {
        const pairAddress = pairFromSymbol[pairSymbol].contract_addr;
        const lpTokenAddress = pairFromSymbol[pairSymbol].liquidity_token;

        const pairQueries = [
          `message.contract_address='${pairAddress}'`,
          `wasm.contract_address='${pairAddress}'`,
          `message.contract_address='${lpTokenAddress}'`,
          `wasm.contract_address='${lpTokenAddress}'`,
        ];

        for (const query of pairQueries) {
          this.ws.send(
            JSON.stringify({
              jsonrpc: '2.0',
              id: pairSymbol, // jsonrpc id
              method: 'subscribe',
              params: { query },
            }),
          );
        }
      }
    };

    this.setState({
      pairs,
      pairFromSymbol,
      tokens,
    });
  }

  async componentWillUnmount() {
    this.props.user.websocketInit();

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
    const isSwap = window.location.hash === '#Swap';
    const isProvide = window.location.hash === '#Provide';
    const isWithdraw = window.location.hash === '#Withdraw';

    if (!isSwap && !isProvide && !isWithdraw) {
      window.location.hash = 'Swap';
      return <></>;
    }

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
              {isSwap && (
                <SwapTab
                  secretjs={this.props.user.secretjs}
                  tokens={this.state.tokens}
                  balances={this.state.balances}
                  pairs={this.state.pairs}
                  pairFromSymbol={this.state.pairFromSymbol}
                />
              )}
              {isProvide && (
                <ProvideTab
                  user={this.props.user}
                  secretjs={this.props.user.secretjs}
                  tokens={this.state.tokens}
                  balances={this.state.balances}
                  pairs={this.state.pairs}
                  pairFromSymbol={this.state.pairFromSymbol}
                />
              )}
              {isWithdraw && (
                <WithdrawTab
                  user={this.props.user}
                  secretjs={this.props.user.secretjs}
                  tokens={this.state.tokens}
                  balances={this.state.balances}
                  pairs={this.state.pairs}
                  pairFromSymbol={this.state.pairFromSymbol}
                />
              )}
            </Box>
            <div>
              Secured by{' '}
              <a href="https://scrt.network" target="_blank">
                Secret Network
              </a>
              <Popup
                trigger={
                  <Icon
                    name="help"
                    circular
                    size="tiny"
                    style={{
                      marginLeft: '0.5rem',
                      background: this.state.securedByIconBackground,
                      verticalAlign: 'middle',
                    }}
                    onMouseEnter={() =>
                      this.setState({
                        securedByIconBackground: 'rgb(237, 238, 242)',
                      })
                    }
                    onMouseLeave={() =>
                      this.setState({
                        securedByIconBackground: 'whitesmoke',
                      })
                    }
                  />
                }
                content="Secret Network protects your swaps from front-running attacks." /* TODO phrasing */
                position="top center"
              />
            </div>
            <Message warning>
              <Message.Header>Hello beta testers! 👋</Message.Header>
              <p>
                <strong>Getting SCRT:</strong>{' '}
                <a href="https://faucet.secrettestnet.io" target="_blank">
                  holodeck-2 faucet
                </a>
              </p>
              <p>
                <strong>Getting ETH:</strong> Swap for it 👆😋
              </p>
              <strong>Feedback channels:</strong>
              <ul>
                <li>
                  Open a{' '}
                  <a
                    href="https://github.com/enigmampc/EthereumBridgeFrontend/issues/new"
                    target="_blank"
                  >
                    GitHub issue
                  </a>
                </li>
                <li>
                  <a
                    href="https://discord.com/channels/360051864110235648/760897182756503572"
                    target="_blank"
                  >
                    #🛠development
                  </a>{' '}
                  on Discord
                </li>
                <li>
                  Tag @assafmo on{' '}
                  <a href="https://t.me/SCRTCommunity" target="_blank">
                    Telegram
                  </a>
                </li>
              </ul>
              <strong>In the works (will be available for mainnet):</strong>
              <ul>
                <li>Withdraw liquidity button</li>
                <li>View pair analytics</li>
                <li>Create a new pair</li>
                <li>Route swapping</li>
                <li>Approval screens before Swap and Provide</li>
                <li>
                  Expert mode (customize slippage, skip approval screens, etc.)
                </li>
                <li>Better stats before Provide liquidity</li>
              </ul>
            </Message>
          </Box>
        </PageContainer>
      </BaseContainer>
    );
  }
}

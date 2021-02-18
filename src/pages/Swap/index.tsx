import React from 'react';
import { Box } from 'grommet';
import * as styles from '../FAQ/faq-styles.styl';
import { PageContainer } from 'components/PageContainer';
import { BaseContainer } from 'components/BaseContainer';
import { useStores } from 'stores';
import './override.css';
import { sleep } from 'utils';
import { NativeToken, Token } from './trade';
import { UserStoreEx } from 'stores/UserStore';
import { observer } from 'mobx-react';
import { SwapTab } from './SwapTab';
import { ProvideTab } from './ProvideTab';
import { WithdrawTab } from './WithdrawTab';
import preloadedTokens from './tokens.json';
import { Button, Image, Popup } from 'semantic-ui-react';
import { BigNumber } from 'bignumber.js';
import { getBalance } from './utils';
import { BetaWarning } from './BetaWarning';
import { SwapFooter } from './Footer';
import { GetSnip20Params } from '../../blockchain-bridge/scrt';
import LocalStorageTokens from '../../blockchain-bridge/scrt/CustomTokens';
import { WalletOverview } from './WalletOverview';
import { CopyWithFeedback } from './CopyWithFeedback';
import cogoToast from 'cogo-toast';

type DisplayTokenRecord = Record<string, TokenDisplay>;

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

export const ERROR_WRONG_VIEWING_KEY = 'Viewing Key Error';

export const flexRowSpace = <span style={{ flex: 1 }}></span>;

export const swapContainerStyle = {
  zIndex: '10',
  borderRadius: '30px',
  backgroundColor: 'white',
  padding: '2em',
  boxShadow:
    'rgba(0, 0, 0, 0.01) 0px 0px 1px, rgba(0, 0, 0, 0.04) 0px 4px 8px, rgba(0, 0, 0, 0.04) 0px 16px 24px, rgba(0, 0, 0, 0.01) 0px 24px 32px',
};

export const SwapPageWrapper = observer(() => {
  // SwapPageWrapper is necessary to get the user store from mobx 🤷‍♂️
  const { user } = useStores();

  return <SwapRouter user={user} />;
});

export class SwapRouter extends React.Component<
  { user: UserStoreEx },
  {
    tokens: {
      [symbol: string]: TokenDisplay;
    };
    balances: {
      [symbol: string]: BigNumber | JSX.Element;
    };
    pairs: Array<Pair>;
    pairFromSymbol: {
      [symbol: string]: Pair;
    };
  }
> {
  private symbolUpdateHeightCache: { [symbol: string]: number } = {};
  private ws: WebSocket;
  public state: {
    tokens: {
      [symbol: string]: TokenDisplay;
    };
    balances: {
      [symbol: string]: BigNumber | JSX.Element;
    };
    pairs: Array<Pair>;
    pairFromSymbol: {
      [symbol: string]: Pair;
    };
  } = {
    tokens: {},
    balances: {},
    pairs: [],
    pairFromSymbol: {},
  };

  constructor(props: { user: UserStoreEx }) {
    super(props);
    window.onhashchange = this.onHashChange;
  }

  onHashChange = () => {
    this.forceUpdate();
  };

  async componentDidMount() {
    window.addEventListener('storage', this.updateTokens);
    window.addEventListener('updatePairsAndTokens', this.updatePairsAndTokens);

    while (!this.props.user.secretjs) {
      await sleep(100);
    }

    const { pairs, tokens, pairFromSymbol } = await this.updatePairsAndTokens();

    this.props.user.websocketTerminate(true);

    this.ws = new WebSocket(process.env.SECRET_WS);

    this.ws.onmessage = async event => {
      try {
        const data = JSON.parse(event.data);

        const symbols: Array<string> = data.id.split('/');

        const heightFromEvent =
          data?.result?.data?.value?.TxResult?.height || data?.result?.data?.value?.block?.header?.height || 0;
        const height = Number(heightFromEvent);

        if (isNaN(height)) {
          console.error(
            `height is NaN for some reason. Unexpected behavior from here on out: got heightFromEvent=${heightFromEvent}`,
          );
        }

        console.log(`Refreshing ${symbols.join(' and ')} for height ${height}`);

        const getViewingKey = async (symbol: string, tokenAddress: string) => {
          let viewingKey: string;
          const currentBalance: string = JSON.stringify(this.state.balances[symbol]);

          if (typeof currentBalance === 'string' && currentBalance.includes(ERROR_WRONG_VIEWING_KEY)) {
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
          const viewingKey = await getViewingKey(lpTokenSymbol, pair.liquidity_token);
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
          let lpTotalSupply = new BigNumber(0);
          try {
            const result: {
              token_info: {
                name: string;
                symbol: string;
                decimals: number;
                total_supply: string;
              };
            } = await this.props.user.secretjs.queryContractSmart(pair.liquidity_token, {
              token_info: {},
            });

            lpTotalSupply = new BigNumber(result.token_info.total_supply);
          } catch (error) {
            console.error(`Error trying to get LP token total supply of ${pairSymbol}`, pair, error);
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
            continue;
          }
          this.symbolUpdateHeightCache[tokenSymbol] = height;

          let viewingKey: string;
          if (tokenSymbol !== 'SCRT') {
            viewingKey = await getViewingKey(tokenSymbol, tokens[tokenSymbol].address);
          }

          const userBalancePromise = getBalance(
            tokenSymbol,
            this.props.user.address,
            tokens,
            viewingKey,
            this.props.user,
          );

          // get all pairs with this token
          const pairs = Object.keys(pairFromSymbol).filter(pairSymbol => pairSymbol.startsWith(`${tokenSymbol}/`));

          // for each pair, update the pool balance of this token
          const poolsBalancesPromises = pairs.map(pairSymbol =>
            getBalance(tokenSymbol, pairFromSymbol[pairSymbol].contract_addr, tokens, 'SecretSwap', this.props.user),
          );

          const freshBalances = await Promise.all([userBalancePromise].concat(poolsBalancesPromises));

          const pairSymbolToFreshBalances: {
            [symbol: string]: BigNumber | JSX.Element;
          } = {};
          for (let i = 0; i < pairs.length; i++) {
            const pairSymbol = pairs[i];
            const [a, b] = pairSymbol.split('/');
            const invertedPairSymbol = `${b}/${a}`;

            pairSymbolToFreshBalances[`${tokenSymbol}-${pairSymbol}`] = freshBalances[i + 1];
            pairSymbolToFreshBalances[`${tokenSymbol}-${invertedPairSymbol}`] = freshBalances[i + 1];
          }

          // Using a callbak to setState prevents a race condition
          // where two tokens gets updated after the same block
          // and they start this update with the same this.state.balances
          // (Atomic setState)
          this.setState(currentState => ({
            balances: Object.assign(
              {},
              currentState.balances,
              {
                [tokenSymbol]: freshBalances[0],
              },
              pairSymbolToFreshBalances,
            ),
          }));
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

      // Register for SCRT events
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

      // Register for token events
      for (const tokenSymbol of Object.keys(tokens)) {
        if (tokenSymbol === 'SCRT') {
          continue;
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

    window.removeEventListener('storage', this.updateTokens);
    window.removeEventListener('updatePairsAndTokens', this.updatePairsAndTokens);
  }

  updateTokens = () => {
    const tokens: DisplayTokenRecord = LocalStorageTokens.get();

    this.setState(currentState => {
      return {
        tokens: {
          ...currentState.tokens,
          ...tokens,
        },
      };
    });
  };

  updatePairsAndTokens = async (): Promise<{
    tokens: {
      [symbol: string]: TokenDisplay;
    };
    pairs: Array<Pair>;
    pairFromSymbol: {
      [symbol: string]: Pair;
    };
  }> => {
    let pairs: Array<Pair> = [];
    try {
      const result: {
        pairs: Array<Pair>;
      } = await this.props.user.secretjs.queryContractSmart(process.env.AMM_FACTORY_CONTRACT, {
        pairs: { limit: 30 },
      });
      pairs = result.pairs;
    } catch (error) {
      this.notify('error', `Cannot fetch list of pairs: ${error.message}`);
    }

    const pairFromSymbol: { [symbol: string]: Pair } = {};

    const tokens: {
      [symbol: string]: TokenDisplay;
    } = {
      ...(await pairs.reduce(async (tokensFromPairs: Promise<DisplayTokenRecord>, pair: Pair) => {
        let unwrapedTokensFromPairs: DisplayTokenRecord = await tokensFromPairs; // reduce with async/await

        const symbols = [];
        for (const t of pair.asset_infos) {
          if ('native_token' in t) {
            unwrapedTokensFromPairs['SCRT'] = preloadedTokens['SCRT'];
            symbols.push('SCRT');
            continue;
          }

          const tokenInfoResponse = await GetSnip20Params({
            secretjs: this.props.user.secretjs,
            address: t.token.contract_addr,
          });

          const symbol = tokenInfoResponse.symbol;

          const displaySymbol = preloadedTokens[symbol]?.symbol || symbol;
          if (!(symbol in unwrapedTokensFromPairs)) {
            unwrapedTokensFromPairs[displaySymbol] = {
              symbol: displaySymbol,
              decimals: tokenInfoResponse.decimals,
              logo: preloadedTokens[symbol] ? preloadedTokens[symbol].logo : '/unknown.png',
              address: t.token.contract_addr,
              token_code_hash: t.token.token_code_hash,
            };
          }
          symbols.push(displaySymbol);
        }
        pairFromSymbol[`${symbols[0]}/${symbols[1]}`] = pair;
        pairFromSymbol[`${symbols[1]}/${symbols[0]}`] = pair;

        return unwrapedTokensFromPairs;
      }, Promise.resolve({}) /* reduce with async/await */)),
      ...LocalStorageTokens.get(),
    };

    this.setState({ pairs, pairFromSymbol, tokens });

    return { pairs, pairFromSymbol, tokens };
  };

  notify(type: 'success' | 'error', msg: string, hideAfterSec: number = 120) {
    if (type === 'error') {
      msg = msg.replaceAll('Failed to decrypt the following error message: ', '');
      msg = msg.replace(/\. Decryption error of the error message:.+?/, '');
    }

    const { hide } = cogoToast[type](msg, {
      position: 'top-right',
      hideAfter: hideAfterSec,
      onClick: () => {
        hide();
      },
    });
    // NotificationManager[type](undefined, msg, closesAfterMs);
  }

  render() {
    const isSwap = window.location.hash === '#Swap';
    const isProvide = window.location.hash === '#Provide';
    const isWithdraw = window.location.hash === '#Withdraw';
    const isPools = window.location.hash === '#Pool';

    if (!isSwap && !isProvide && !isWithdraw && !isPools) {
      window.location.hash = 'Swap';
      return <></>;
    }

    return (
      <BaseContainer>
        <div
          style={{ position: 'absolute', right: '10%', cursor: 'pointer' }}
          onClick={() => {
            if (this.props.user.secretjs) {
              return;
            }

            this.props.user.signIn(true);
          }}
        >
          <Popup
            header={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <strong>{this.props.user.address}</strong>
                <span style={{ marginLeft: '0.3em' }}>
                  <CopyWithFeedback text={this.props.user.address} />
                </span>
              </div>
            }
            content={<WalletOverview tokens={this.state.tokens} balances={this.state.balances} />}
            position="bottom left"
            basic
            on="click"
            trigger={
              <Button basic style={{ padding: 0, borderRadius: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Image src="/keplr.svg" size="mini" />
                  <span style={{ margin: '0 0.3em' }}>My Wallet</span>
                </div>
              </Button>
            }
          />
        </div>
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
                  notify={this.notify}
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
                  notify={this.notify}
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
                  notify={this.notify}
                />
              )}
            </Box>
            <SwapFooter />
            <BetaWarning secretjs={this.props.user.secretjs} />
          </Box>
        </PageContainer>
      </BaseContainer>
    );
  }
}

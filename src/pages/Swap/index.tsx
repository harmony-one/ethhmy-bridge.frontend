import React from 'react';
import { Box } from 'grommet';
import * as styles from '../FAQ/faq-styles.styl';
import { PageContainer } from 'components/PageContainer';
import { BaseContainer } from 'components/BaseContainer';
import { useStores } from 'stores';
import './override.css';
import { sleep } from 'utils';
import { Asset, NativeToken, Token } from './trade';
import { UserStoreEx } from 'stores/UserStore';
import { observer } from 'mobx-react';
import { SwapTab } from './SwapTab';
import { ProvideTab } from './ProvideTab';
import { WithdrawTab } from './WithdrawTab';
import { Image, Popup } from 'semantic-ui-react';
import { BigNumber } from 'bignumber.js';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';
import { getNativeBalance, getTokenBalance } from './utils';
import { BetaWarning } from './BetaWarning';
import { SwapFooter } from './Footer';
import { GetSnip20Params, getViewingKey } from '../../blockchain-bridge';
import LocalStorageTokens from '../../blockchain-bridge/scrt/CustomTokens';
import { WalletOverview } from './WalletOverview';
import { CopyWithFeedback } from './CopyWithFeedback';
import { loadTokensFromList } from './LoadTokensFromList';
import { ITokenInfo } from '../../stores/interfaces';
import { Tokens } from '../../stores/Tokens';
import { GetAllPairs } from '../../blockchain-bridge/scrt/swap';
import { SwapToken, SwapTokenMap, TokenMapfromITokenInfo } from './SwapToken';

//type DisplayTokenRecord = Record<string, TokenDisplay>;

export type Pair = {
  asset_infos: Array<NativeToken | Token>;
  contract_addr: string;
  liquidity_token: string;
  token_code_hash: string;
};

export type PairMap = Map<string, NewPair>;

export class NewPair {
  pair_identifier: string;
  asset_infos: Asset[];
  contract_addr: string;
  liquidity_token: string;
  //token_code_hash: string;

  constructor(
    symbol0: string,
    asset0: NativeToken | Token,
    symbol1: string,
    asset1: NativeToken | Token,
    contract_addr,
    liquidity_token,
    pair_identifier,
  ) {
    //const symbol0 = asset0.type === 'native_token' ? asset0.native_token.denom : asset0.token.contract_addr;
    this.asset_infos[0] = new Asset(symbol0, asset0);
    this.asset_infos[1] = new Asset(symbol1, asset1);
    this.contract_addr = contract_addr;
    this.liquidity_token = liquidity_token;
    this.pair_identifier = pair_identifier;
    //this.token_code_hash = token_code_hash;
  }

  identifier(): string {
    return this.pair_identifier;
  }

  isSymbolInPair(symbol: string): boolean {
    return symbol.toUpperCase() === this.asset_infos[0].symbol || symbol.toUpperCase() === this.asset_infos[1].symbol;
  }

  isIdInPair(id: string): boolean {
    const pairIdentifiers = this.pair_identifier.split('-');

    for (const pId in pairIdentifiers) {
      if (pId.toLowerCase() === id) {
        return true;
      }
    }

    return false;
  }

  static fromPair(pair: Pair, tokenMap: SwapTokenMap) {
    const identifiers = getIdentifiersFromPair(pair);

    const symbol0 = tokenMap[identifiers[0]].symbol;
    const symbol1 = tokenMap[identifiers[1]].symbol;

    const pair_identifier = pairIdFromTokenIds(identifiers[0], identifiers[1]);

    //const symbol0 = asset0.type === 'native_token' ? asset0.native_token.denom : asset0.token.contract_addr;
    return new NewPair(
      symbol0,
      pair.asset_infos[0],
      symbol1,
      pair.asset_infos[1],
      pair.contract_addr,
      pair.liquidity_token,
      pair_identifier,
    );
  }
}

const pairIdFromTokenIds = (id0: string, id1: string): string => {
  return id0.localeCompare(id1) ? `${id0}-${id1}` : `${id1}-${id0}`;
};

const getIdentifiersFromPair = (pair: Pair): string[] => {
  let identifiers = [];

  if (pair.asset_infos[0].type === 'native_token') {
    identifiers.push(pair.asset_infos[0].native_token.denom);
  } else {
    identifiers.push(pair.asset_infos[0].token.contract_addr);
  }

  if (pair.asset_infos[1].type === 'native_token') {
    identifiers.push(pair.asset_infos[1].native_token.denom);
  } else {
    identifiers.push(pair.asset_infos[1].token.contract_addr);
  }

  return identifiers;
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
  const { user, tokens } = useStores();

  return <SwapRouter user={user} tokens={tokens} />;
});

//tokens: { [symbol: string]: TokenDisplay };
export class SwapRouter extends React.Component<
  { user: UserStoreEx; tokens: Tokens },
  {
    allTokens: SwapTokenMap;
    balances: { [symbol: string]: BigNumber | JSX.Element };
    pairs: PairMap;
    pairFromSymbol: { [symbol: string]: Pair };
  }
> {
  private symbolUpdateHeightCache: { [symbol: string]: number } = {};
  private ws: WebSocket;
  public state: {
    allTokens: SwapTokenMap;
    balances: {
      [symbol: string]: BigNumber | JSX.Element;
    };
    pairs: PairMap;
    pairFromSymbol: {
      [symbol: string]: Pair;
    };
    selectedPair: NewPair | undefined;
    selectedToken0: string;
    selectedToken1: string;
  } = {
    allTokens: new Map<string, SwapToken>(),
    balances: {},
    pairs: new Map<string, NewPair>(),
    pairFromSymbol: {},
    selectedPair: undefined,
    selectedToken0: '',
    selectedToken1: '',
  };

  constructor(props: { user: UserStoreEx; tokens: Tokens }) {
    super(props);
    window.onhashchange = this.onHashChange;
  }

  onHashChange = () => {
    this.forceUpdate();
  };

  // pairFromIds = (id1: string, id2: string): Pair | null => {
  //   return this.state.pairs.filter(p => {})[0];
  // };

  async componentDidMount() {
    window.addEventListener('storage', this.updateTokens);
    window.addEventListener('updatePairsAndTokens', this.updatePairs);

    while (!this.props.user.secretjs) {
      await sleep(100);
    }

    //const { pairs, tokens } = await this.updatePairs();
    await this.updatePairs();

    this.props.user.websocketTerminate(true);

    this.ws = new WebSocket(process.env.SECRET_WS);

    this.ws.onmessage = async event => {
      try {
        const data = JSON.parse(event.data);

        const symbols: Array<string> = data.id.split('-');

        // todo: move this to another function
        const heightFromEvent =
          data?.result?.data?.value?.TxResult?.height || data?.result?.data?.value?.block?.header?.height || 0;
        const height = Number(heightFromEvent);

        // todo: why not break here?
        if (isNaN(height)) {
          console.error(
            `height is NaN for some reason. Unexpected behavior from here on out: got heightFromEvent=${heightFromEvent}`,
          );
        }

        console.log(`Refreshing ${symbols.join(' and ')} for height ${height}`);

        const pairSymbol = data.id;
        const pair = this.state.pairs[pairSymbol];
        if (pair) {
          console.log('Refresh LP token for', pairSymbol);
          // update my LP token balance
          const lpTokenSymbol = `LP-${pairSymbol}`;
          const viewingKey = await getViewingKey({
            keplr: this.props.user.keplrWallet,
            address: pair.liquidity_token,
            chainId: this.props.user.chainId,
            //todo: this sucks
            currentBalance: JSON.stringify(this.state.balances[this.state.allTokens.get(lpTokenSymbol).symbol]),
          });

          const lpBalance = await getTokenBalance(
            this.props.user.address,
            this.state.allTokens[lpTokenSymbol].address,
            viewingKey,
            this.props.user,
          );

          // update LP token total supply
          let lpTotalSupply = new BigNumber(0);
          try {
            const result = await GetSnip20Params({ address: pair.liquidity_token, secretjs: this.props.user.secretjs });

            lpTotalSupply = new BigNumber(result.total_supply);
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
          let userBalancePromise: Promise<BigNumber | JSX.Element>;
          if (tokenSymbol !== 'SCRT') {
            // todo: move this inside getTokenBalance?
            const tokenAddress = this.state.allTokens[tokenSymbol].address;
            const viewingKey = await getViewingKey({
              keplr: this.props.user.keplrWallet,
              address: tokenAddress,
              chainId: this.props.user.chainId,
              //todo: this sucks
              //this.state.allTokens.get(tokenSymbol).symbol
              currentBalance: JSON.stringify(this.state.balances[tokenSymbol]),
            });
            userBalancePromise = getTokenBalance(this.props.user.address, tokenAddress, viewingKey, this.props.user);
          } else {
            userBalancePromise = getNativeBalance(this.props.user.address, this.props.user.secretjs);
          }

          // todo: not sure why this is here
          // get all pairs with this token
          // const pairs = Object.keys(pairFromSymbol).filter(pairSymbol => pairSymbol.startsWith(`${tokenSymbol}/`));
          //
          // // for each pair, update the pool balance of this token
          // const poolsBalancesPromises = pairs.map(pairSymbol =>
          //   getBalance(tokenSymbol, pairFromSymbol[pairSymbol].contract_addr, tokens, 'SecretSwap', this.props.user),
          // );
          //
          // const freshBalances = await Promise.all([userBalancePromise].concat(poolsBalancesPromises));
          //
          // const pairSymbolToFreshBalances: {
          //   [symbol: string]: BigNumber | JSX.Element;
          // } = {};
          // for (let i = 0; i < pairs.length; i++) {
          //   const pairSymbol = pairs[i];
          //   const [a, b] = pairSymbol.split('/');
          //   const invertedPairSymbol = `${b}/${a}`;
          //
          //   pairSymbolToFreshBalances[`${tokenSymbol}-${pairSymbol}`] = freshBalances[i + 1];
          //   pairSymbolToFreshBalances[`${tokenSymbol}-${invertedPairSymbol}`] = freshBalances[i + 1];
          // }

          // Using a callbak to setState prevents a race condition
          // where two tokens gets updated after the same block
          // and they start this update with the same this.state.balances
          // (Atomic setState)          // this.setState(currentState => ({
          //           //   balances: Object.assign(
          //           //     {},
          //           //     currentState.balances,
          //           //     {
          //           //       [tokenSymbol]: freshBalances[0],
          //           //     },
          //           //     pairSymbolToFreshBalances,
          //           //   ),
          //           // }));
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
      for (const token of [
        this.state.allTokens[this.state.selectedToken0],
        this.state.allTokens[this.state.selectedToken1],
      ]) {
        if (token.symbol === 'SCRT') {
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
          const tokenAddress = token.address;
          const tokenQueries = [
            `message.contract_address='${tokenAddress}'`,
            `wasm.contract_address='${tokenAddress}'`,
          ];

          for (const query of tokenQueries) {
            this.ws.send(
              JSON.stringify({
                jsonrpc: '2.0',
                id: token.symbol, // jsonrpc id
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
      // const uniquePairSymbols: Array<string> = Object.values(
      //   Object.keys(pairFromSymbol).reduce((symbolFromPair, symbol) => {
      //     const pair = JSON.stringify(pairFromSymbol[symbol]);
      //     if (pair in symbolFromPair) {
      //       return symbolFromPair;
      //     }
      //
      //     return Object.assign(symbolFromPair, {
      //       [pair]: symbol,
      //     });
      //   }, {}),
      // );

      //for (const pairSymbol of uniquePairSymbols) {
      const pairAddress = this.state.selectedPair.contract_addr;
      const lpTokenAddress = this.state.selectedPair.liquidity_token;

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
            id: this.state.selectedPair.identifier(), // jsonrpc id
            method: 'subscribe',
            params: { query },
          }),
        );
      }
      //}
    };

    // this.setState({
    //   pairs,
    //   //pairFromSymbol,
    //   tokens,
    // });
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
    window.removeEventListener('updatePairsAndTokens', this.updatePairs);
  }

  updateTokens = () => {
    const tokens: ITokenInfo[] = [...this.props.tokens.allData];

    // convert to token map for swap
    const swapTokens: SwapTokenMap = TokenMapfromITokenInfo(tokens); // [...TokenMapfromITokenInfo(tokens), ...loadTokensFromList('secret-2')];

    // load custom tokens
    for (const t of LocalStorageTokens.get()) {
      swapTokens.set(t.identifier, t);
    }

    // load hardcoded tokens (scrt, atom, etc.)
    for (const t of loadTokensFromList('secret-2')) {
      swapTokens.set(t.identifier, t);
    }

    this.setState(_currentState => {
      return {
        allTokens: swapTokens,
      };
    });
  };

  setCurrentPair = (token0: string, token1: string) => {
    const selectedPair: NewPair = this.state.pairs.get(pairIdFromTokenIds(token0, token1));

    this.setState(currentState => {
      return {
        ...currentState,
        selectedPair: selectedPair,
      };
    });
  };

  updatePairs = async () => {
    // gather tokens from our list, and from local storage
    await this.updateTokens();

    // todo: check if keplr is connected

    let { pairs }: { pairs: Array<Pair> } = await GetAllPairs({ secretjs: this.props.user.secretjs });

    // filter all pairs that aren't known tokens
    pairs.filter(p => {
      if (p.asset_infos[0].type === 'native_token') {
        if (!(p.asset_infos[0].native_token.denom in this.state.allTokens)) {
          return false;
        }
      } else {
        if (!(p.asset_infos[0].token.contract_addr in this.state.allTokens)) {
          return false;
        }
      }

      return true;
    });

    const newPairs: PairMap = new Map<string, NewPair>();

    for (const p of pairs) {
      const newPair = NewPair.fromPair(p, this.state.allTokens);
      newPairs.set(newPair.identifier(), newPair);
    }
    // const tokens: ITokenInfo[] = {
    //   ...loadTokensFromList('secret-2'),
    //   ...LocalStorageTokens.get(),
    // };
    //
    // const pairFromSymbol: { [symbol: string]: Pair } = {};

    // for (const p of pairs) {
    //   const symbols = [];
    //   for (const t of p.asset_infos) {
    //     if ('native_token' in t) {
    //       //unwrapedTokensFromPairs['SCRT'] = tokens['SCRT'];
    //       symbols.push('SCRT');
    //       continue;
    //     }
    //
    //     const tokenInfoResponse = await GetSnip20Params({
    //       secretjs: this.props.user.secretjs,
    //       address: t.token.contract_addr,
    //     });
    //
    //     //const symbol = tokenInfoResponse.symbol;
    //   }
    //   pairFromSymbol[`${symbols[0]}/${symbols[1]}`] = pair;
    // }

    //const pairFromSymbol: { [symbol: string]: Pair } = {};

    // const tokens: {
    //   [symbol: string]: TokenDisplay;
    // } = {
    //   ...(await pairs.reduce(async (tokensFromPairs: Promise<DisplayTokenRecord>, pair: Pair) => {
    //     let unwrapedTokensFromPairs: DisplayTokenRecord = await tokensFromPairs; // reduce with async/await
    //
    //     const symbols = [];
    //     for (const t of pair.asset_infos) {
    //       if ('native_token' in t) {
    //         unwrapedTokensFromPairs['SCRT'] = preloadedTokens['secret-2']['SCRT'];
    //         symbols.push('SCRT');
    //         continue;
    //       }
    //
    //       const tokenInfoResponse = await GetSnip20Params({
    //         secretjs: this.props.user.secretjs,
    //         address: t.token.contract_addr,
    //       });
    //
    //       const symbol = tokenInfoResponse.symbol;
    //
    //       const displaySymbol = preloadedTokens[symbol]?.symbol || symbol;
    //       if (!(symbol in unwrapedTokensFromPairs)) {
    //         unwrapedTokensFromPairs[displaySymbol] = {
    //           symbol: displaySymbol,
    //           decimals: tokenInfoResponse.decimals,
    //           logo: preloadedTokens[symbol] ? preloadedTokens[symbol].logo : '/unknown.png',
    //           address: t.token.contract_addr,
    //           token_code_hash: t.token.token_code_hash,
    //         };
    //       }
    //       symbols.push(displaySymbol);
    //     }
    //     pairFromSymbol[`${symbols[0]}/${symbols[1]}`] = pair;
    //     pairFromSymbol[`${symbols[1]}/${symbols[0]}`] = pair;
    //
    //     return unwrapedTokensFromPairs;
    //   }, Promise.resolve({}) /* reduce with async/await */)),
    //   ...LocalStorageTokens.get(),
    // };

    this.setState({ pairs: newPairs });

    //return { pairs: newPairs, tokens: swapTokens };
  };

  notify(type: 'success' | 'error', msg: string, closesAfterMs: number = 120_000) {
    NotificationManager[type](undefined, msg, closesAfterMs);
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
            content={<WalletOverview tokens={this.state.allTokens} balances={this.state.balances} />}
            position="left center"
            on="click"
            trigger={<Image src="/keplr.svg" size="mini" />}
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
                  tokens={this.state.allTokens}
                  balances={this.state.balances}
                  selectedPair={this.state.selectedPair}
                  pairFromSymbol={this.state.pairFromSymbol}
                  notify={this.notify}
                  onSetTokens={(token0, token1) => {
                    this.setCurrentPair(token0, token1);
                  }}
                />
              )}
              {isProvide && (
                <ProvideTab
                  user={this.props.user}
                  secretjs={this.props.user.secretjs}
                  tokens={this.state.allTokens}
                  balances={this.state.balances}
                  //pairs={this.state.pairs}
                  pairs={[]}
                  pairFromSymbol={this.state.pairFromSymbol}
                  notify={this.notify}
                />
              )}
              {isWithdraw && (
                <WithdrawTab
                  user={this.props.user}
                  secretjs={this.props.user.secretjs}
                  tokens={this.state.allTokens}
                  balances={this.state.balances}
                  //pairs={this.state.pairs}
                  pairs={[]}
                  pairFromSymbol={this.state.pairFromSymbol}
                  notify={this.notify}
                />
              )}
            </Box>
            <SwapFooter />
            <BetaWarning secretjs={this.props.user.secretjs} />
          </Box>
        </PageContainer>
        <NotificationContainer />
      </BaseContainer>
    );
  }
}

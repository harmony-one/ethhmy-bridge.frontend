import React from 'react';
import { Box } from 'grommet';
import * as styles from '../FAQ/faq-styles.styl';
import { PageContainer } from 'components/PageContainer';
import { BaseContainer } from 'components/BaseContainer';
import { useStores } from 'stores';
import { sleep, unlockToken } from 'utils';
import { UserStoreEx } from 'stores/UserStore';
import { observer } from 'mobx-react';
import { SwapTab } from './SwapTab';
import { ProvideTab } from './ProvideTab';
import { WithdrawTab } from './WithdrawTab';
import { BigNumber } from 'bignumber.js';
import { getNativeBalance, unlockJsx } from './utils';
import { BetaWarning } from '../../components/Swap/BetaWarning';
import { SwapFooter } from './Footer';
import { GetSnip20Params } from '../../blockchain-bridge';
import { loadTokensFromList } from './LocalTokens/LoadTokensFromList';
import { ITokenInfo } from '../../stores/interfaces';
import { Tokens } from '../../stores/Tokens';
import { GetAllPairs, getSymbolsFromPair } from '../../blockchain-bridge/scrt/swap';
import { SwapToken, SwapTokenMap, TokenMapfromITokenInfo } from './types/SwapToken';
import LocalStorageTokens from '../../blockchain-bridge/scrt/CustomTokens';
import cogoToast from 'cogo-toast';
import { pairIdFromTokenIds, PairMap, SwapPair } from './types/SwapPair';
import { KeplrButton } from '../../components/Secret/KeplrButton';
import { NativeToken, Token } from './types/trade';

export const SwapPageWrapper = observer(() => {
  // SwapPageWrapper is necessary to get the user store from mobx 🤷‍♂️
  const { user, tokens } = useStores();

  return <SwapRouter user={user} tokens={tokens} />;
});

export class SwapRouter extends React.Component<
  { user: UserStoreEx; tokens: Tokens },
  {
    allTokens: SwapTokenMap;
    balances: { [symbol: string]: BigNumber | JSX.Element };
    pairs: PairMap;
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
    selectedPair: SwapPair | undefined;
    selectedToken0: string;
    selectedToken1: string;
    queries: string[];
  } = {
    allTokens: new Map<string, SwapToken>(),
    balances: {},
    pairs: new Map<string, SwapPair>(),
    selectedPair: undefined,
    selectedToken0: process.env.SSCRT_CONTRACT,
    selectedToken1: '',
    queries: [],
  };

  constructor(props: { user: UserStoreEx; tokens: Tokens }) {
    super(props);
    window.onhashchange = this.onHashChange;
  }

  onHashChange = () => {
    this.forceUpdate();
  };

  async componentDidUpdate(previousProps, prevState) {
    if (previousProps.tokens.allData.length !== this.props.tokens.allData.length) {
      await this.updateTokens();
    }

    const tokensToRefresh = [];

    if (this.state.selectedToken1 && !this.state.balances[this.state.selectedToken1]) {
      tokensToRefresh.push(this.state.selectedToken1);
    }

    if (this.state.selectedToken0 && !this.state.balances[this.state.selectedToken0]) {
      tokensToRefresh.push(this.state.selectedToken0);
    }

    if (tokensToRefresh.length > 0) {
      await this.refreshBalances({ tokenSymbols: tokensToRefresh });
    }

    if (
      prevState.selectedToken0 !== this.state.selectedToken0 ||
      prevState.selectedToken1 !== this.state.selectedToken1
    ) {
      this.unSubscribeAll();

      // Register for token or SCRT events
      this.registerTokenQueries(this.state.selectedToken0, this.state.selectedToken1);

      // Register for pair events
      this.registerPairQueries(this.state.selectedPair);
    }
  }

  async reRegisterPairHooks() {}

  async componentDidMount() {
    window.addEventListener('storage', this.updateTokens);
    window.addEventListener('updatePairsAndTokens', this.updatePairs);

    if (!this.props.user.secretjs) {
      await this.updateTokens();
    }

    while (!this.props.user.secretjs) {
      await sleep(100);
    }

    await this.updatePairs();

    this.props.user.websocketTerminate(true);

    this.ws = new WebSocket(process.env.SECRET_WS);

    this.ws.onmessage = async event => {
      await this.onMessage(event);
    };

    this.ws.onopen = async () => {
      // Here we register for token related events
      // Then in onmessage we know when to refresh all the balances
      while (!this.props.user.address) {
        await sleep(100);
      }

      // Register for SCRT events
      this.registerSCRTQueries();

      // Register for token or SCRT events
      // this.registerTokenQueries();
      //
      // // Register for pair events
      // this.registerPairQueries();
      //}
    };
  }

  private async refreshBalances(params: { tokenSymbols: string[]; pair?: SwapPair; height?: number }) {
    let { height, pair, tokenSymbols } = params;

    if (!height) {
      height = await this.props.user.secretjs.getHeight();
    }

    //console.log(`Hello from refreshBalances for height: ${height}`);
    let balanceTasks = tokenSymbols.map(s => {
      return this.refreshTokenBalance(height, s);
    });

    // these will return a list of promises, which we will flatten then map to a single object
    if (pair) {
      balanceTasks.push(this.refreshLpTokenBalance(pair));
      balanceTasks.push(this.refreshPoolBalance(pair));
    }

    let results = await Promise.all([...balanceTasks]);

    // flatten array to a single object
    const newObject = Object.assign(
      {},
      ...results.flat().map(item => ({ [Object.keys(item)[0]]: Object.values(item)[0] })),
    );

    this.setState(currentState => ({
      balances: {
        ...currentState.balances,
        ...newObject,
      },
    }));
  }

  private async onMessage(event: WebSocketMessageEvent | MessageEvent<any>) {
    try {
      const data = JSON.parse(event.data);

      if (data.id === -1) {
        return;
      }

      const symbols: Array<string> = data.id.split('-');

      // refresh selected token balances as well (because why not?)
      if (this.state.selectedToken0) {
        symbols.push(this.state.allTokens.get(this.state.selectedToken0)?.identifier);
      }
      if (this.state.selectedToken1) {
        symbols.push(this.state.allTokens.get(this.state.selectedToken1)?.identifier);
      }

      // todo: move this to another function
      const height = SwapRouter.getHeightFromEvent(data);

      console.log(`Refreshing ${symbols.join(' and ')} for height ${height}`);

      const pairSymbol = data.id;
      const pair = this.state.pairs.get(pairSymbol);

      if (pair !== this.state.selectedPair) {
        console.log(`Got message for pair other than the selected one ${pair} vs ${this.state.selectedPair}`);
      }

      await this.refreshBalances({ height, tokenSymbols: symbols, pair });
    } catch (error) {
      console.log(error);
    }
  }

  private async refreshPoolBalance(pair: SwapPair) {
    let balances = [];
    try {
      const res: {
        assets: Array<{ amount: string; info: Token | NativeToken }>;
        total_share: string;
      } = await this.props.user.secretjs.queryContractSmart(pair.contract_addr, {
        pool: {},
      });

      const amount0 = new BigNumber(res.assets[0].amount);
      const amount1 = new BigNumber(res.assets[1].amount);
      if ('native_token' in res.assets[0].info) {
        balances.push({
          [`${res.assets[0].info.native_token.denom}-${pair.identifier()}`]: amount0,
        });
      } else {
        balances.push({
          [`${res.assets[0].info.token.contract_addr}-${pair.identifier()}`]: amount0,
        });
      }
      if ('native_token' in res.assets[1].info) {
        balances.push({
          [`${res.assets[1].info.native_token.denom}-${pair.identifier()}`]: amount1,
        });
      } else {
        balances.push({
          [`${res.assets[1].info.token.contract_addr}-${pair.identifier()}`]: amount1,
        });
      }
    } catch (error) {
      this.notify('error', `Error getting pools' balances for ${pair.identifier()}: ${error.message}`);
    }

    return balances;
  }

  private async refreshTokenBalance(height: number, tokenSymbol: string) {
    if (height <= this.symbolUpdateHeightCache[tokenSymbol]) {
      //console.log(`${tokenSymbol} already fresh for height ${height}`);
      return {};
    }
    this.symbolUpdateHeightCache[tokenSymbol] = height;

    let userBalancePromise; //balance.includes(unlockToken)
    if (tokenSymbol !== 'uscrt') {
      // todo: move this inside getTokenBalance?
      const tokenAddress = this.state.allTokens.get(tokenSymbol).address;

      let balance = await this.props.user.getSnip20Balance(tokenAddress);

      if (balance.includes(unlockToken)) {
        balance = unlockJsx({
          onClick: async () => {
            await this.props.user.keplrWallet.suggestToken(this.props.user.chainId, tokenAddress);
            // TODO trigger balance refresh if this was an "advanced set" that didn't
            // result in an on-chain transaction
          },
        });
        userBalancePromise = balance;
      } else {
        userBalancePromise = new BigNumber(balance);
      }
    } else {
      userBalancePromise = await getNativeBalance(this.props.user.address, this.props.user.secretjs);
    }

    return { [tokenSymbol]: userBalancePromise };
  }

  private async refreshLpTokenBalance(pair: SwapPair) {
    const pairSymbol = pair.identifier();
    console.log('Refresh LP token for', pairSymbol);
    // update my LP token balance
    const lpTokenSymbol = `LP-${pairSymbol}`;
    const lpTokenAddress = pair.liquidity_token;
    let lpTotalSupply = new BigNumber(0);
    try {
      const result = await GetSnip20Params({ address: pair.liquidity_token, secretjs: this.props.user.secretjs });
      lpTotalSupply = new BigNumber(result.total_supply);
    } catch (error) {
      console.error(`Error trying to get LP token total supply of ${pairSymbol}`, pair, error);
      return [];
    }

    let balanceResult = await this.props.user.getSnip20Balance(lpTokenAddress);
    let lpBalance;
    if (balanceResult.includes(unlockToken)) {
      balanceResult = unlockJsx({
        onClick: async () => {
          await this.props.user.keplrWallet.suggestToken(this.props.user.chainId, lpTokenAddress);
          // TODO trigger balance refresh if this was an "advanced set" that didn't
          // result in an on-chain transaction
          await this.refreshLpTokenBalance(pair);
        },
      });
      lpBalance = balanceResult;
    } else {
      lpBalance = new BigNumber(balanceResult);
    }

    return [
      {
        [lpTokenSymbol]: lpBalance,
      },
      {
        [`${lpTokenSymbol}-total-supply`]: lpTotalSupply,
      },
    ];
  }

  private static getHeightFromEvent(data) {
    const heightFromEvent =
      data?.result?.data?.value?.TxResult?.height || data?.result?.data?.value?.block?.header?.height || 0;
    const height = Number(heightFromEvent);

    // todo: why not break here?
    if (isNaN(height)) {
      console.error(
        `height is NaN for some reason. Unexpected behavior from here on out: got heightFromEvent=${heightFromEvent}`,
      );
    }
    return height;
  }

  private registerSCRTQueries() {
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
          id: 'uscrt', // jsonrpc id
          method: 'subscribe',
          params: { query },
        }),
      );
    }
  }

  private registerTokenQueries(token0: string, token1: string) {
    for (const token of [this.state.allTokens.get(token0), this.state.allTokens.get(token1)]) {
      console.log(`Registering queries for ${token.symbol}`);
      const tokenAddress = token.address;
      const tokenQueries = [`message.contract_address='${tokenAddress}'`, `wasm.contract_address='${tokenAddress}'`];
      for (const query of tokenQueries) {
        this.ws.send(
          JSON.stringify({
            jsonrpc: '2.0',
            id: token.identifier, // jsonrpc id
            method: 'subscribe',
            params: { query },
          }),
        );
        this.state.queries.push(token.identifier);
      }
    }
  }

  private registerPairQueries(pair?: SwapPair) {
    const registerPair = pair || this.state.selectedPair;
    if (!registerPair) {
      console.log('Tried to register queries for empty pair');
      return;
    }

    const pairAddress = registerPair.contract_addr;
    const lpTokenAddress = registerPair.liquidity_token;

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
          id: registerPair.identifier(), // jsonrpc id
          method: 'subscribe',
          params: { query },
        }),
      );
      this.state.queries.push(registerPair.identifier());
    }
  }

  unSubscribePair(pair: SwapPair) {
    console.log(`Unsubscribing queries for ${pair.identifier()}`);
    this.ws.send(
      JSON.stringify({
        jsonrpc: '2.0',
        id: pair.identifier(),
        method: 'unsubscribe',
      }),
    );
  }

  unSubscribeAll() {
    for (const query of this.state.queries) {
      console.log(`Unsubscribing queries for ${query}`);
      this.ws.send(
        JSON.stringify({
          jsonrpc: '2.0',
          id: query,
          method: 'unsubscribe',
        }),
      );
    }
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
    const customTokens = LocalStorageTokens.get();
    customTokens.forEach(t => {
      swapTokens.set(t.identifier, t);
    });

    //load hardcoded tokens (scrt, atom, etc.)
    for (const t of loadTokensFromList(this.props.user.chainId || process.env.CHAIN_ID)) {
      swapTokens.set(t.identifier, t);
    }

    this.setState(_currentState => {
      return {
        allTokens: swapTokens,
      };
    });
  };

  setCurrentPair = async (token0: string, token1: string) => {
    const selectedPair: SwapPair = this.state.pairs.get(pairIdFromTokenIds(token0, token1));

    this.setState(currentState => {
      return {
        ...currentState,
        selectedPair: selectedPair,
      };
    });

    const height = await this.props.user.secretjs.getHeight();
    await this.refreshBalances({ height, tokenSymbols: [token0, token1], pair: selectedPair });
  };

  updatePairs = async () => {
    // gather tokens from our list, and from local storage
    await this.updateTokens();

    let pairs = [];
    try {
      pairs = (await GetAllPairs({ secretjs: this.props.user.secretjs })).pairs;
    } catch (error) {
      this.notify('error', `Cannot fetch list of pairs: ${error.message}`);
      return;
    }

    // filter all pairs that aren't known tokens
    pairs = pairs.filter(p => {
      for (const s of getSymbolsFromPair(p)) {
        if (!this.state.allTokens.has(s)) {
          return false;
        }
      }

      return true;
    });

    const newPairs: PairMap = new Map<string, SwapPair>();

    for (const p of pairs) {
      const newPair = SwapPair.fromPair(p, this.state.allTokens);
      newPairs.set(newPair.identifier(), newPair);
    }

    this.setState({ pairs: newPairs });
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
              <KeplrButton />
              {isSwap && (
                <SwapTab
                  secretjs={this.props.user.secretjs}
                  tokens={this.state.allTokens}
                  balances={this.state.balances}
                  selectedPair={this.state.selectedPair}
                  selectedToken0={this.state.selectedToken0}
                  selectedToken1={this.state.selectedToken1}
                  notify={this.notify}
                  onSetTokens={async (token0, token1) => await this.onSetTokens(token0, token1)}
                />
              )}
              {isProvide && (
                <ProvideTab
                  user={this.props.user}
                  secretjs={this.props.user.secretjs}
                  tokens={this.state.allTokens}
                  balances={this.state.balances}
                  pairs={this.state.pairs}
                  selectedPair={this.state.selectedPair}
                  selectedToken0={this.state.selectedToken0}
                  selectedToken1={this.state.selectedToken1}
                  notify={this.notify}
                  onSetTokens={async (token0, token1) => await this.onSetTokens(token0, token1)}
                />
              )}
              {isWithdraw && (
                <WithdrawTab
                  user={this.props.user}
                  secretjs={this.props.user.secretjs}
                  tokens={this.state.allTokens}
                  balances={this.state.balances}
                  pairs={this.state.pairs}
                  notify={this.notify}
                  updateToken={async pair => {
                    await this.registerPairQueries(pair);
                    const results = await this.refreshLpTokenBalance(pair);
                    this.setState(currentState => ({
                      balances: {
                        ...currentState.balances,
                        ...results[0],
                        ...results[1],
                      },
                    }));
                  }}
                  onCloseTab={pair => {
                    this.unSubscribePair(pair);
                  }}
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

  private onSetTokens = async (token0, token1) => {
    this.setState(currentState => ({
      ...currentState,
      selectedToken0: token0,
      selectedToken1: token1,
    }));
    if (token0 && token1) {
      await this.setCurrentPair(token0, token1);
    }
  };
}

import { action, observable } from 'mobx';
import { IStores } from 'stores';
import { statusFetching } from '../constants';
import { StoreConstructor } from './core/StoreConstructor';
import * as agent from 'superagent';
import { IOperation } from './interfaces';
import {
  divDecimals,
  formatWithSixDecimals,
  sleep,
  toFixedTrunc,
  unlockToken,
} from '../utils';
import { SigningCosmWasmClient } from 'secretjs';
import {
  getViewingKey,
  QueryDeposit,
  QueryRewards,
  Snip20GetBalance,
} from '../blockchain-bridge/scrt';

export const rewardsDepositKey = key => `${key}RewardsDeposit`;

export const rewardsKey = key => `${key}Rewards`;

export class UserStoreEx extends StoreConstructor {
  public declare stores: IStores;
  @observable public isAuthorized: boolean;
  public status: statusFetching;
  redirectUrl: string;

  @observable public keplrWallet: any;
  @observable public keplrOfflineSigner: any;
  @observable public secretjs: SigningCosmWasmClient;
  @observable public isKeplrWallet = false;
  @observable public error: string;

  @observable public sessionType: 'mathwallet' | 'ledger' | 'wallet';
  @observable public address: string;
  @observable public balanceSCRT: string;

  @observable public balanceToken: { [key: string]: string } = {};
  @observable public balanceTokenMin: { [key: string]: string } = {};

  @observable public balanceRewards: { [key: string]: string } = {};

  @observable public scrtRate = 0;
  @observable public ethRate = 0;

  @observable public snip20Address = '';
  @observable public snip20Balance = '';
  @observable public snip20BalanceMin = '';

  @observable public isInfoReading = false;
  @observable public chainId: string;

  @observable public ws: WebSocket;

  constructor(stores) {
    super(stores);

    // setInterval(() => this.getBalances(), 15000);

    this.getRates();

    // Load tokens from DB
    this.stores.tokens.init();
    this.stores.tokens.fetch();

    const keplrCheckPromise = new Promise<void>((accept, _reject) => {
      // 1. Every one second, check if Keplr was injected to the page
      const keplrCheckInterval = setInterval(async () => {
        this.isKeplrWallet =
          // @ts-ignore
          !!window.keplr &&
          // @ts-ignore
          !!window.getOfflineSigner &&
          // @ts-ignore
          !!window.getEnigmaUtils;
        // @ts-ignore
        this.keplrWallet = window.keplr;

        if (this.isKeplrWallet) {
          // Keplr is present, stop checking
          clearInterval(keplrCheckInterval);
          accept();
        }
      }, 1000);
    });

    const session = localStorage.getItem('keplr_session');

    const sessionObj = JSON.parse(session);

    if (sessionObj) {
      this.address = sessionObj.address;
      this.isInfoReading = sessionObj.isInfoReading;
      keplrCheckPromise.then(async () => {
        await this.signIn();

        this.getBalances();

        this.websocketInit();
      });
    }
  }

  @action public async websocketTerminate(waitToBeOpen?: boolean) {
    if (waitToBeOpen) {
      while (!this.ws && this.ws.readyState !== WebSocket.OPEN) {
        await sleep(100);
      }
    }

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.close(1000 /* Normal Closure */, 'Ba bye');
    }
  }

  @action public async websocketInit() {
    if (this.ws) {
      while (this.ws.readyState === WebSocket.CONNECTING) {
        await sleep(100);
      }

      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.close(1012 /* Service Restart */, 'Refreshing connection');
      }
    }

    this.ws = new WebSocket(process.env.SECRET_WS);

    const symbolUpdateHeightCache: { [symbol: string]: number } = {};

    this.ws.onmessage = async event => {
      try {
        const data = JSON.parse(event.data);

        const symbol = data.id;

        if (!(symbol in symbolUpdateHeightCache)) {
          console.error(
            symbol,
            'not in symbolUpdateHeightCache:',
            symbolUpdateHeightCache,
          );
          return;
        }

        let height = 0;
        try {
          height = Number(data.result.data.value.TxResult.height);
        } catch (error) {
          // Not a tx
          // Probably just the /subscribe ok event
          return;
        }

        if (height <= symbolUpdateHeightCache[symbol]) {
          console.log('Already updated', symbol, 'for height', height);
          return;
        }
        symbolUpdateHeightCache[symbol] = height;
        await this.updateBalanceForSymbol(symbol);
      } catch (error) {
        console.log(error);
      }
    };

    this.ws.onopen = async () => {
      while (this.stores.tokens.allData.length === 0) {
        await sleep(100);
      }

      while (!this.address.startsWith('secret')) {
        await sleep(100);
      }

      for (const token of this.stores.rewards.allData) {
        // For any tx on this token's address or rewards pool => update my balance
        const symbol = token.inc_token.symbol.replace('s', '');

        symbolUpdateHeightCache[symbol] = 0;

        const tokenQueries = [
          `message.contract_address='${token.inc_token.address}'`,
          `wasm.contract_address='${token.inc_token.address}'`,
          `message.contract_address='${token.pool_address}'`,
          `wasm.contract_address='${token.pool_address}'`,
        ];

        for (const query of tokenQueries) {
          this.ws.send(
            JSON.stringify({
              jsonrpc: '2.0',
              id: symbol, // jsonrpc id
              method: 'subscribe',
              params: { query },
            }),
          );
        }
      }

      // Also hook sSCRT
      symbolUpdateHeightCache['sSCRT'] = 0;
      const secretScrtQueries = [
        `message.contract_address='${process.env.SSCRT_CONTRACT}'`,
        `wasm.contract_address='${process.env.SSCRT_CONTRACT}'`,
      ];

      for (const query of secretScrtQueries) {
        this.ws.send(
          JSON.stringify({
            jsonrpc: '2.0',
            id: 'sSCRT', // jsonrpc id
            method: 'subscribe',
            params: { query },
          }),
        );
      }

      symbolUpdateHeightCache['SCRT'] = 0;
      const scrtQueries = [
        `message.sender='${this.address}'` /* sent a tx (gas) */,
        `message.signer='${this.address}'` /* executed a contract (gas) */,
        `transfer.recipient='${this.address}'` /* received SCRT */,
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
    };
  }

  @action public setInfoReading() {
    this.isInfoReading = true;
    this.syncLocalStorage();
  }

  @action public async signIn(wait?: boolean) {
    this.error = '';

    console.log('Waiting for Keplr...');
    while (wait && !this.keplrWallet) {
      await sleep(100);
    }
    console.log('Found Keplr');

    this.chainId = process.env.CHAIN_ID;
    try {
      // Setup Secret Testnet (not needed on mainnet)
      if (process.env.ENV !== 'MAINNET') {
        await this.keplrWallet.experimentalSuggestChain({
          chainId: this.chainId,
          chainName: process.env.CHAIN_NAME,
          rpc: process.env.SECRET_RPC,
          rest: process.env.SECRET_LCD,
          bip44: {
            coinType: 529,
          },
          coinType: 529,
          stakeCurrency: {
            coinDenom: 'SCRT',
            coinMinimalDenom: 'uscrt',
            coinDecimals: 6,
          },
          bech32Config: {
            bech32PrefixAccAddr: 'secret',
            bech32PrefixAccPub: 'secretpub',
            bech32PrefixValAddr: 'secretvaloper',
            bech32PrefixValPub: 'secretvaloperpub',
            bech32PrefixConsAddr: 'secretvalcons',
            bech32PrefixConsPub: 'secretvalconspub',
          },
          currencies: [
            {
              coinDenom: 'SCRT',
              coinMinimalDenom: 'uscrt',
              coinDecimals: 6,
            },
          ],
          feeCurrencies: [
            {
              coinDenom: 'SCRT',
              coinMinimalDenom: 'uscrt',
              coinDecimals: 6,
            },
          ],
          gasPriceStep: {
            low: 0.1,
            average: 0.25,
            high: 0.4,
          },
          features: ['secretwasm'],
        });
      }

      // Ask the user for permission
      await this.keplrWallet.enable(this.chainId);

      // @ts-ignore
      this.keplrOfflineSigner = window.getOfflineSigner(this.chainId);
      const accounts = await this.keplrOfflineSigner.getAccounts();
      this.address = accounts[0].address;
      this.isAuthorized = true;

      this.secretjs = new SigningCosmWasmClient(
        process.env.SECRET_LCD,
        this.address,
        this.keplrOfflineSigner,
        // @ts-ignore
        window.getEnigmaUtils(this.chainId),
        {
          init: {
            amount: [{ amount: '300000', denom: 'uscrt' }],
            gas: '300000',
          },
          exec: {
            amount: [{ amount: '500000', denom: 'uscrt' }],
            gas: '500000',
          },
        },
      );

      this.syncLocalStorage();
    } catch (error) {
      this.error = error.message;
      this.isAuthorized = false;
      console.error('keplr login error', error);
    }
  }

  @action public getSnip20Balance = async (
    snip20Address: string,
    decimals: string | number,
  ): Promise<string> => {
    if (!this.secretjs) {
      return '0';
    }

    const decimalsNum = Number(decimals);
    if (!decimalsNum) {
      throw new Error('Token not found');
    }

    const viewingKey = await getViewingKey({
      keplr: this.keplrWallet,
      chainId: this.chainId,
      address: snip20Address,
    });

    return await Snip20GetBalance({
      secretjs: this.secretjs,
      token: snip20Address,
      address: this.address,
      key: viewingKey,
      decimals: decimalsNum,
    });
  };

  @action public getBridgeRewardsBalance = async (
    snip20Address: string,
  ): Promise<string> => {
    if (!this.secretjs) {
      return '0';
    }

    const height = await this.secretjs.getHeight();

    const viewingKey = await getViewingKey({
      keplr: this.keplrWallet,
      chainId: this.chainId,
      address: snip20Address,
    });

    const result = await QueryRewards({
      cosmJS: this.secretjs,
      contract: snip20Address,
      address: this.address,
      key: viewingKey,
      height: String(height),
    });

    return result;
  };

  @action public getBridgeDepositBalance = async (
    snip20Address: string,
  ): Promise<string> => {
    if (!this.secretjs) {
      return '0';
    }

    const viewingKey = await getViewingKey({
      keplr: this.keplrWallet,
      chainId: this.chainId,
      address: snip20Address,
    });

    return await QueryDeposit({
      cosmJS: this.secretjs,
      contract: snip20Address,
      address: this.address,
      key: viewingKey,
    });
  };

  @action public getBalances = async () => {
    Promise.all([
      this.updateBalanceForSymbol('SCRT'),
      this.updateBalanceForSymbol('sSCRT'),
    ]);
    Promise.all(
      this.stores.tokens.allData.map(token =>
        this.updateBalanceForSymbol(token.display_props.symbol),
      ),
    );
  };

  @action public updateBalanceForSymbol = async (
    symbol: string,
    tokenAddress?: string,
  ) => {
    while (
      !this.address &&
      !this.secretjs &&
      this.stores.tokens.allData.length === 0
    ) {
      await sleep(100);
    }

    if (!symbol && tokenAddress === process.env.SSCRT_CONTRACT) {
      symbol = 'sSCRT';
    }
    if (!symbol && tokenAddress) {
      try {
        symbol = this.stores.tokens.allData.find(
          t => t.dst_address === tokenAddress,
        ).display_props.symbol;
      } catch (error) {
        console.error(
          'Error finding symbol for SNIP20 address',
          tokenAddress,
          error,
        );
      }
    }
    if (!symbol) {
      return;
    }

    console.log('updating', symbol, 'balance');

    if (symbol === 'SCRT') {
      this.secretjs.getAccount(this.address).then(account => {
        try {
          this.balanceSCRT = formatWithSixDecimals(
            divDecimals(account.balance[0].amount, 6),
          );
        } catch (e) {
          this.balanceSCRT = '0';
        }
      });
      return;
    }
    if (symbol === 'sSCRT') {
      try {
        const balance = await this.getSnip20Balance(
          process.env.SSCRT_CONTRACT,
          6,
        );
        if (balance.includes(unlockToken)) {
          this.balanceToken['sSCRT'] = balance;
        } else {
          this.balanceToken['sSCRT'] = formatWithSixDecimals(
            toFixedTrunc(balance, 6),
          );
        }
      } catch (err) {
        this.balanceToken['sSCRT'] = unlockToken;
      }
      return;
    }

    const token = this.stores.tokens.allData.find(
      t => t.display_props.symbol === symbol,
    );

    try {
      const balance = await this.getSnip20Balance(
        token.dst_address,
        token.decimals,
      );
      if (balance.includes(unlockToken)) {
        this.balanceToken[token.src_coin] = balance;
      } else {
        this.balanceToken[token.src_coin] = formatWithSixDecimals(
          toFixedTrunc(balance, 6),
        );
      }
    } catch (err) {
      this.balanceToken[token.src_coin] = unlockToken;
    }

    try {
      this.balanceTokenMin[token.src_coin] = token.display_props.min_from_scrt;
    } catch (e) {
      // Ethereum?
    }

    const rewradsToken = this.stores.rewards.allData.find(
      t => t.inc_token.symbol === `s${symbol}`,
    );

    if (!rewradsToken) {
      console.log('No rewards token for', symbol);
      return;
    }

    try {
      const balance = await this.getBridgeRewardsBalance(
        rewradsToken.pool_address,
      );

      if (balance.includes(unlockToken)) {
        this.balanceRewards[
          rewardsKey(rewradsToken.inc_token.symbol)
        ] = balance;
      } else {
        // rewards are in the rewards_token decimals
        this.balanceRewards[
          rewardsKey(rewradsToken.inc_token.symbol)
        ] = divDecimals(balance, rewradsToken.rewards_token.decimals); //divDecimals(balance, token.inc_token.decimals);
      }
    } catch (err) {
      this.balanceRewards[
        rewardsKey(rewradsToken.inc_token.symbol)
      ] = unlockToken;
    }

    try {
      const balance = await this.getBridgeDepositBalance(
        rewradsToken.pool_address,
      );

      if (balance.includes(unlockToken)) {
        this.balanceRewards[
          rewardsDepositKey(rewradsToken.inc_token.symbol)
        ] = balance;
      } else {
        this.balanceRewards[
          rewardsDepositKey(rewradsToken.inc_token.symbol)
        ] = divDecimals(balance, rewradsToken.inc_token.decimals);
      }
    } catch (err) {
      this.balanceRewards[
        rewardsDepositKey(rewradsToken.inc_token.symbol)
      ] = unlockToken;
    }

    try {
      const balance = await this.getSnip20Balance(
        rewradsToken.rewards_token.address,
        rewradsToken.rewards_token.decimals,
      );

      if (balance.includes(unlockToken)) {
        this.balanceRewards[rewradsToken.rewards_token.symbol] = balance;
      } else {
        this.balanceRewards[rewradsToken.rewards_token.symbol] = divDecimals(
          balance,
          rewradsToken.rewards_token.decimals,
        );
      }
    } catch (err) {
      this.balanceRewards[rewradsToken.rewards_token.symbol] = unlockToken;
    }
  };

  @action public signOut() {
    this.isAuthorized = false;
    this.address = null;
    this.syncLocalStorage();
  }

  private syncLocalStorage() {
    localStorage.setItem(
      'keplr_session',
      JSON.stringify({
        address: this.address,
        isInfoReading: this.isInfoReading,
      }),
    );
  }

  @action public signTransaction(txn: any) {
    /*  if (this.sessionType === 'mathwallet' && this.isKeplrWallet) {
      return this.keplrWallet.signTransaction(txn);
    } */
  }

  public saveRedirectUrl(url: string) {
    if (!this.isAuthorized && url) {
      this.redirectUrl = url;
    }
  }

  @action public async getRates() {
    const scrtbtc = await agent.get<{ body: IOperation }>(
      'https://api.binance.com/api/v1/ticker/24hr?symbol=SCRTBTC',
    );
    const btcusdt = await agent.get<{ body: IOperation }>(
      'https://api.binance.com/api/v1/ticker/24hr?symbol=BTCUSDT',
    );

    this.scrtRate = scrtbtc.body.lastPrice * btcusdt.body.lastPrice;

    const ethusdt = await agent.get<{ body: IOperation }>(
      'https://api.binance.com/api/v1/ticker/24hr?symbol=ETHUSDT',
    );

    this.ethRate = ethusdt.body.lastPrice;
  }
}

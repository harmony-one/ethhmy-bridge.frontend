import { action, observable } from 'mobx';
import { IStores } from 'stores';
import { statusFetching } from '../constants';
/*
import {
  getHmyBalance,
  hmyMethodsERC20,
  hmyMethodsBUSD,
  hmyMethodsLINK,
} from '../blockchain-bridge';
*/
import { StoreConstructor } from './core/StoreConstructor';
import * as agent from 'superagent';
import { IOperation } from './interfaces';
import { divDecimals, formatWithSixDecimals, unlockToken, valueToDecimals } from '../utils';
import { SigningCosmWasmClient } from 'secretjs';
import { getViewingKey, QueryDeposit, QueryRewards, Snip20GetBalance } from '../blockchain-bridge/scrt';

const defaults = {};

export const rewardsDepositKey = key => `${key}RewardsDeposit`

export const rewardsKey = key => `${key}Rewards`

// export const rewardsTokens = [{
//   symbol: "ETH",
//   rewardsContract: "secret1g6c4vq5me8ymctuvalxsqn38glxrvzadflleck",
//   decimals: "1",
//   underlyingDecimals: "18",
//   lockedAsset: "sETH",
//   totalLocked: "5,000,000",
//   remainingLockedRewards: "10000000",
//   deadline: 1610024346,
// }]

export class UserStoreEx extends StoreConstructor {
  declare public stores: IStores;
  @observable public isAuthorized: boolean;
  public status: statusFetching;
  redirectUrl: string;

  public keplrWallet: any;
  private keplrOfflineSigner: any;
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

  constructor(stores) {
    super(stores);

    this.getBalances();
    setInterval(() => this.getBalances(), 15000);

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
      keplrCheckPromise.then(() => this.signIn());
    }
  }

  @action public setInfoReading() {
    this.isInfoReading = true;
    this.syncLocalStorage();
  }

  @action public async signIn() {
    this.error = '';

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
            amount: [{ amount: '350000', denom: 'uscrt' }],
            gas: '350000',
          },
        },
      );

      this.syncLocalStorage();
    } catch (error) {
      this.error = error.message;
      this.isAuthorized = false;
    }
  }

  @action public getSnip20Balance = async (snip20Address: string, decimals: string | number): Promise<string> => {
    if (!this.secretjs) {
      return '0';
    }

    const decimalsNum = Number(decimals);
    if (!decimalsNum) {
      throw new Error("Token not found")
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

  @action public getBridgeRewardsBalance = async (snip20Address: string): Promise<string> => {
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

    return result
  };

  @action public getBridgeDepositBalance = async (snip20Address: string): Promise<string> => {
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
    if (this.address) {
      this.secretjs.getAccount(this.address).then(account => {
        try {
          this.balanceSCRT = formatWithSixDecimals(
            divDecimals(account.balance[0].amount, 6),
          );
        } catch (e) {
          this.balanceSCRT = '0';
        }
      });

      for (const token of this.stores.tokens.allData) {
        if (
          this.snip20Address !== token.dst_address &&
          this.snip20Address !== '' &&
          token.src_coin !== 'Ethereum'
        ) {
          continue;
        }
        try {
          const balance = await this.getSnip20Balance(token.dst_address, token.decimals);
          if (balance.includes(unlockToken)) {
            this.balanceToken[token.src_coin] = balance;
          } else {
            this.balanceToken[token.src_coin] = formatWithSixDecimals(balance);
          }
        } catch (err) {
          this.balanceToken[token.src_coin] = unlockToken;
        }

        try {
          this.balanceTokenMin[token.src_coin] =
            token.display_props.min_from_scrt;
        } catch (e) {
          // Ethereum?
        }
      }


      for (const token of this.stores.rewards.allData) {
        try {

          const balance = await this.getBridgeRewardsBalance(token.pool_address)

          if (balance.includes(unlockToken)) {
            this.balanceRewards[rewardsKey(token.inc_token.symbol)] = balance;
          } else {
            // rewards are in the rewards_token decimals
            this.balanceRewards[rewardsKey(token.inc_token.symbol)] = divDecimals(balance, token.rewards_token.decimals);//divDecimals(balance, token.inc_token.decimals);
          }
        } catch (err) {
          this.balanceRewards[rewardsKey(token.inc_token.symbol)] = unlockToken;
        }

        try {
          const balance = await this.getBridgeDepositBalance(token.pool_address)

          if (balance.includes(unlockToken)) {
            this.balanceRewards[rewardsDepositKey(token.inc_token.symbol)] = balance;
          } else {
            this.balanceRewards[rewardsDepositKey(token.inc_token.symbol)] = divDecimals(balance, token.inc_token.decimals);
          }
        } catch (err) {
          this.balanceRewards[rewardsDepositKey(token.inc_token.symbol)] = unlockToken;
        }

        try {
          const balance = await this.getSnip20Balance(token.rewards_token.address, token.rewards_token.decimals)

          if (balance.includes(unlockToken)) {
            this.balanceRewards[token.rewards_token.symbol] = balance;
          } else {
            this.balanceRewards[token.rewards_token.symbol] = divDecimals(balance, token.rewards_token.decimals);
          }
        } catch (err) {
          this.balanceRewards[token.rewards_token.symbol] = unlockToken;
        }
      }
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

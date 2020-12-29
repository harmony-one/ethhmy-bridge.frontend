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
import { divDecimals, formatWithSixDecimals } from '../utils';
import { SigningCosmWasmClient } from 'secretjs';
import { getViewingKey, QueryDeposit, QueryRewards, Snip20GetBalance } from '../blockchain-bridge/scrt';

const defaults = {};

export const rewardsDepositKey = key => `${key}RewardsDeposit`

export const rewardsKey = key => `${key}Rewards`

export const rewardsTokens = [{
  symbol: "ETH",
  rewardsContract: "secret1phq7va80a83z2sqpyqsuxhl045ruf2ld6xa89m",
  decimals: "6",
  lockedAsset: "sETH",
  totalLocked: "5,000,000"
}]

export class UserStoreEx extends StoreConstructor {
  public stores: IStores;
  @observable public isAuthorized: boolean;
  public status: statusFetching;
  redirectUrl: string;

  private keplrWallet: any;
  private keplrOfflineSigner: any;
  @observable public cosmJS: SigningCosmWasmClient;
  @observable public isKeplrWallet = false;
  @observable public error: string;

  @observable public sessionType: 'mathwallet' | 'ledger' | 'wallet';
  @observable public address: string;
  @observable public balanceSCRT: string;

  @observable public balanceToken: { [key: string]: string } = {};

  @observable public balanceRewards: { [key: string]: string } = {};

  @observable public hmyBUSDBalanceManager: number = 0;
  @observable public hmyLINKBalanceManager: number = 0;

  @observable public scrtRate = 0;
  @observable public ethRate = 0;

  @observable public snip20Address = '';
  @observable public snip20Balance = '';

  @observable public isInfoReading = false;
  @observable public chainId: string;

  constructor(stores) {
    super(stores);

    this.getBalances();
    setInterval(() => this.getBalances(), 5000);

    this.getRates();

    const keplrCheckPromise = new Promise((accept, _reject) => {
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

    if (sessionObj && sessionObj.address) {
      this.address = sessionObj.address;
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

      this.cosmJS = new SigningCosmWasmClient(
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
            amount: [{ amount: '300000', denom: 'uscrt' }],
            gas: '300000',
          },
        },
      );

      // Load tokens from DB
      this.stores.tokens.init();
      await this.stores.tokens.fetch();

      this.syncLocalStorage();
    } catch (error) {
      this.error = error.message;
      this.isAuthorized = false;
    }
  }

  @action public getBridgeRewardsBalance = async (snip20Address: string, decimals: string): Promise<string> => {
    if (!this.cosmJS) {
      return '0';
    }

    const height = await this.cosmJS.getHeight();

    const decimalsNum = Number(decimals);
    if (!decimalsNum) {
      throw new Error("Token not found")
    }

    const viewingKey = await getViewingKey({
      keplr: this.keplrWallet,
      chainId: this.chainId,
      address: snip20Address,
    });

    const result = await QueryRewards({
      cosmJS: this.cosmJS,
      contract: snip20Address,
      address: this.address,
      key: viewingKey,
      height: String(height),
    });

    return result
  };

  @action public getBridgeDepositBalance = async (snip20Address: string, decimals: string): Promise<string> => {
    if (!this.cosmJS) {
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

    return await QueryDeposit({
      cosmJS: this.cosmJS,
      contract: snip20Address,
      address: this.address,
      key: viewingKey,
    });
  };


  @action public getSnip20Balance = async (snip20Address: string, decimals: string): Promise<string> => {
    if (!this.cosmJS) {
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
      cosmJS: this.cosmJS,
      token: snip20Address,
      address: this.address,
      key: viewingKey,
      decimals: decimalsNum,
    });
  };

  @action public getBalances = async () => {
    if (this.address) {
      this.cosmJS.getAccount(this.address).then(account => {
        try {
          this.balanceSCRT = formatWithSixDecimals(
            divDecimals(account.balance[0].amount, 6),
          );
        } catch (e) {
          this.balanceSCRT = '0';
        }
      });

      for (const token of this.stores.tokens.allData) {
        try {
          const balance = await this.getSnip20Balance(token.dst_address, token.decimals);
          if (balance.includes('Unlock')) {
            this.balanceToken[token.src_coin] = balance;
          } else {
            this.balanceToken[token.src_coin] = formatWithSixDecimals(balance);
          }
        } catch (err) {
          this.balanceToken[token.src_coin] = 'Unlock';
        }
      }


      for (const token of rewardsTokens) {
        try {
          const balance = await this.getBridgeRewardsBalance(token.rewardsContract, token.decimals)

          console.log(`token ${token.rewardsContract} rewards balance: ${balance}`)

          if (balance.includes('Unlock')) {
            this.balanceRewards[rewardsKey(token.symbol)] = balance;
          } else {
            this.balanceRewards[rewardsKey(token.symbol)] = formatWithSixDecimals(balance);
          }
        } catch (err) {
          this.balanceRewards[rewardsKey(token.symbol)] = 'Unlock';
        }

        try {
          const balance = await this.getBridgeDepositBalance(token.rewardsContract, token.decimals)

          console.log(`token ${token.rewardsContract} deposit balance: ${balance}`)

          if (balance.includes('Unlock')) {
            this.balanceRewards[rewardsDepositKey(token.symbol)] = balance;
          } else {
            this.balanceRewards[rewardsDepositKey(token.symbol)] = formatWithSixDecimals(balance);
          }
        } catch (err) {
          this.balanceRewards[rewardsDepositKey(token.symbol)] = 'Unlock';
        }
      }

      try {
        const balance = await this.getSnip20Balance("secret1s7c6xp9wltthk5r6mmavql4xld5me3g37guhsx", "6")

        //console.log(balance)

        if (balance.includes('Unlock')) {
          this.balanceRewards["sscrt"] = balance;
        } else {
          this.balanceRewards["sscrt"] = formatWithSixDecimals(balance);
        }
      } catch (err) {
        this.balanceRewards["sscrt"] = 'Unlock';
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

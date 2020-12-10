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

const defaults = {};

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
  @observable public balanceTokenMin: { [key: string]: string } = {};

  @observable public hmyBUSDBalanceManager: number = 0;
  @observable public hmyLINKBalanceManager: number = 0;

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

  @action public getSnip20Balance = async snip20Address => {
    if (!this.cosmJS) {
      return '0';
    }

    let balanceResponse;
    try {
      balanceResponse = await this.cosmJS.queryContractSmart(snip20Address, {
        balance: {
          address: this.address,
          key: await this.keplrWallet.getSecret20ViewingKey(
            this.chainId,
            snip20Address,
          ),
        },
      });
    } catch (e) {
      return 'Unlock';
    }

    if (balanceResponse.viewing_key_error) {
      return 'Fix Unlock';
    }

    if (Number(balanceResponse.balance.amount) === 0) {
      return '0';
    }

    const decimalsResponse = await this.cosmJS.queryContractSmart(
      snip20Address,
      {
        token_info: {},
      },
    );

    return divDecimals(
      balanceResponse.balance.amount,
      decimalsResponse.token_info.decimals,
    );
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
          const balance = await this.getSnip20Balance(token.dst_address);
          if (balance.includes('Unlock')) {
            this.balanceToken[token.src_coin] = balance;
          } else {
            this.balanceToken[token.src_coin] = formatWithSixDecimals(balance);
          }
        } catch (err) {
          this.balanceToken[token.src_coin] = 'Unlock';
        }

        try {
          this.balanceTokenMin[token.src_coin] =
            token.display_props.min_from_scrt;
        } catch (e) {
          // Ethereum?
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

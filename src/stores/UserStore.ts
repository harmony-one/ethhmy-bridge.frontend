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
import { divDecimals } from '../utils';
import { SigningCosmWasmClient } from 'secretjs';

const defaults = {};

export const sETH = 'secret1gf4u2mcxswreylr3sqj2vg4dn2tll0xqdqrg6l';
export const sTUSD = 'secret1lsuf99lvtjx4se8j458080zqau63j4l5dn8y8r';
export const sYEENUS = 'secret1yt3gd4mvem2m6uu0uq3fm0h29uf0tgu9f4l8x6';

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

  @observable public balance_sETH: string = '0';
  @observable public balance_sTUSD: string = '0';
  @observable public balance_sYEENUS: string = '0';

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
          !!(window as any).keplr &&
          !!(window as any).getOfflineSigner &&
          !!(window as any).getEnigmaUtils;
        this.keplrWallet = (window as any).keplr;

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

    this.chainId = 'holodeck-2';
    try {
      // Setup Secret Testnet (not needed on mainnet)
      await this.keplrWallet.experimentalSuggestChain({
        chainId: this.chainId,
        chainName: 'Secret Testnet',
        rpc: 'http://bootstrap.secrettestnet.io:26657',
        rest: 'https://bootstrap.secrettestnet.io',
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

      // Ask the user for permission
      await this.keplrWallet.enable(this.chainId);

      this.keplrOfflineSigner = (window as any).getOfflineSigner(this.chainId);
      const accounts = await this.keplrOfflineSigner.getAccounts();
      this.address = accounts[0].address;
      this.isAuthorized = true;

      this.cosmJS = new SigningCosmWasmClient(
        'https://bootstrap.secrettestnet.io/',
        this.address,
        this.keplrOfflineSigner,
        (window as any).getEnigmaUtils(this.chainId),
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

      // Add SNIP20s to
      await this.keplrWallet.suggestToken(this.chainId, sETH);
      await this.keplrWallet.suggestToken(this.chainId, sTUSD);
      await this.keplrWallet.suggestToken(this.chainId, sYEENUS);
      this.syncLocalStorage();
    } catch (error) {
      this.error = error.message;
      this.isAuthorized = false;
    }
  }

  @action public getSnip20Balance = async snip20Address => {
    const balanceResponse = await this.cosmJS.queryContractSmart(
      snip20Address,
      {
        balance: {
          address: this.address,
          key: await this.keplrWallet.getSecret20ViewingKey(
            this.chainId,
            snip20Address,
          ),
        },
      },
    );

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
      try {
        const sEthBalance = await this.cosmJS.queryContractSmart(sETH, {
          balance: {
            address: this.address,
            key: await this.keplrWallet.getSecret20ViewingKey(
              this.chainId,
              sETH,
            ),
          },
        });
        if (sEthBalance && sEthBalance.balance) {
          this.balance_sETH = divDecimals(sEthBalance.balance.amount, 18);
        }

        const sTusdBalance = await this.cosmJS.queryContractSmart(sTUSD, {
          balance: {
            address: this.address,
            key: await this.keplrWallet.getSecret20ViewingKey(
              this.chainId,
              sTUSD,
            ),
          },
        });
        if (sTusdBalance && sTusdBalance.balance) {
          this.balance_sTUSD = divDecimals(sTusdBalance.balance.amount, 18);
        }

        const sYeenusBalance = await this.cosmJS.queryContractSmart(sYEENUS, {
          balance: {
            address: this.address,
            key: await this.keplrWallet.getSecret20ViewingKey(
              this.chainId,
              sYEENUS,
            ),
          },
        });
        if (sYeenusBalance && sYeenusBalance.balance) {
          this.balance_sYEENUS = divDecimals(sYeenusBalance.balance.amount, 8);
        }

        /* 
        let res = await getHmyBalance(this.address);
        this.balance = res && res.result;

        if (this.snip20Address) {
          const snip20Balance = await hmyMethodsERC20.checkHmyBalance(
            this.snip20Address,
            this.address,
          );

          this.snip20Balance = divDecimals(
            snip20Balance,
            this.stores.userMetamask.erc20TokenDetails.decimals,
          );
        }

        let resBalance = 0;

        resBalance = await hmyMethodsBUSD.checkHmyBalance(this.address);
        this.hmyBUSDBalance = divDecimals(resBalance, 18);

        resBalance = await hmyMethodsLINK.checkHmyBalance(this.address);
        this.hmyLINKBalance = divDecimals(resBalance, 18);
 */
      } catch (e) {
        console.error(e);
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

import { action, observable } from 'mobx';
import { IStores } from 'stores';
import { statusFetching } from '../constants';
import {
  getHmyBalance,
  hmyMethodsERC20,
  hmyMethodsBUSD,
  hmyMethodsLINK,
} from '../blockchain-bridge';
import { StoreConstructor } from './core/StoreConstructor';
import * as agent from 'superagent';
import { IOperation } from './interfaces';
import { divDecimals } from '../utils';
import { SigningCosmWasmClient } from 'secretjs';

const defaults = {};

export class UserStoreEx extends StoreConstructor {
  public stores: IStores;
  @observable public isAuthorized: boolean;
  public status: statusFetching;
  redirectUrl: string;

  private keplrWallet: any;
  private keplrOfflineSigner: any;
  private cosmJS: SigningCosmWasmClient;
  @observable public isKeplrWallet = false;

  @observable public sessionType: 'mathwallet' | 'ledger' | 'wallet';
  @observable public address: string;

  @observable public balance: string = '0';
  /* 
  @observable public hmyBUSDBalance: string = '0';
  @observable public hmyLINKBalance: string = '0';
  */
  @observable public hmyBUSDBalanceManager: number = 0;
  @observable public hmyLINKBalanceManager: number = 0;

  @observable public scrtRate = 0;
  @observable public ethRate = 0;

  @observable public hrc20Address = '';
  @observable public hrc20Balance = '';

  @observable public isInfoReading = false;
  @observable public chainId: string;

  constructor(stores) {
    super(stores);

    setInterval(async () => {
      // @ts-ignore
      this.isKeplrWallet =
        !!(window as any).keplr && !!(window as any).getOfflineSigner;
      // @ts-ignore
      this.keplrWallet = window.keplr;

      this.chainId = 'holodeck-2';
      if (this.isKeplrWallet) {
        try {
          await this.keplrWallet.experimentalSuggestChain({
            // Chain-id of the Cosmos SDK chain.
            chainId: 'holodeck-2',
            // The name of the chain to be displayed to the user.
            chainName: 'Secret Testnet',
            // RPC endpoint of the chain.
            rpc: 'http://bootstrap.secrettestnet.io:26657',
            // REST endpoint of the chain.
            rest: 'https://bootstrap.secrettestnet.io',
            // Staking coin information
            bip44: {
              // You can only set the coin type of BIP44.
              // 'Purpose' is fixed to 44.
              coinType: 529,
            },
            // (Optional) The number of the coin type.
            // This field is only used to fetch the address from ENS.
            // Ideally, it is recommended to be the same with BIP44 path's coin type.
            // However, some early chains may choose to use the Cosmos Hub BIP44 path of '118'.
            // So, this is separated to support such chains.
            coinType: 529,
            stakeCurrency: {
              // Coin denomination to be displayed to the user.
              coinDenom: 'SCRT',
              // Actual denom (i.e. uatom, uscrt) used by the blockchain.
              coinMinimalDenom: 'uscrt',
              // # of decimal points to convert minimal denomination to user-facing denomination.
              coinDecimals: 6,
              // (Optional) Keplr can show the fiat value of the coin if a coingecko id is provided.
              // You can get id from https://api.coingecko.com/api/v3/coins/list if it is listed.
              // coinGeckoId: ""
            },
            // Bech32 configuration to show the address to user.
            // This field is the interface of
            // {
            //   bech32PrefixAccAddr: string;
            //   bech32PrefixAccPub: string;
            //   bech32PrefixValAddr: string;
            //   bech32PrefixValPub: string;
            //   bech32PrefixConsAddr: string;
            //   bech32PrefixConsPub: string;
            // }
            bech32Config: {
              bech32PrefixAccAddr: 'secret',
              bech32PrefixAccPub: 'secretpub',
              bech32PrefixValAddr: 'secretvaloper',
              bech32PrefixValPub: 'secretvaloperpub',
              bech32PrefixConsAddr: 'secretvalcons',
              bech32PrefixConsPub: 'secretvalconspub',
            },
            // List of all coin/tokens used in this chain.
            currencies: [
              {
                // Coin denomination to be displayed to the user.
                coinDenom: 'SCRT',
                // Actual denom (i.e. uatom, uscrt) used by the blockchain.
                coinMinimalDenom: 'uscrt',
                // # of decimal points to convert minimal denomination to user-facing denomination.
                coinDecimals: 6,
                // (Optional) Keplr can show the fiat value of the coin if a coingecko id is provided.
                // You can get id from https://api.coingecko.com/api/v3/coins/list if it is listed.
                // coinGeckoId: ""
              },
            ],
            // List of coin/tokens used as a fee token in this chain.
            feeCurrencies: [
              {
                // Coin denomination to be displayed to the user.
                coinDenom: 'SCRT',
                // Actual denom (i.e. uatom, uscrt) used by the blockchain.
                coinMinimalDenom: 'uscrt',
                // # of decimal points to convert minimal denomination to user-facing denomination.
                coinDecimals: 6,
                // (Optional) Keplr can show the fiat value of the coin if a coingecko id is provided.
                // You can get id from https://api.coingecko.com/api/v3/coins/list if it is listed.
                // coinGeckoId: ""
              },
            ],
          });
        } catch (error) {
          console.error(error);
        }
        try {
          await this.keplrWallet.enable(this.chainId);

          this.keplrOfflineSigner = (window as any).getOfflineSigner(
            this.chainId,
          );
          const accounts = await this.keplrOfflineSigner.getAccounts();
          this.address = accounts[0].address;
          this.isAuthorized = true;

          this.cosmJS = new SigningCosmWasmClient(
            'https://bootstrap.secrettestnet.io/',
            this.address,
            this.keplrOfflineSigner,
          );
        } catch (error) {
          console.error(error);
        }
      }

      // await this.getBalances();
      // await this.getOneBalance();
    }, 3000);

    setInterval(() => this.getBalances(), 3 * 1000);

    this.getRates();

    // @ts-ignore
    this.isKeplrWallet = !!window.keplr;
    // @ts-ignore
    this.keplrWallet = window.keplr;
    /* 
    const session = localStorage.getItem('harmony_session');

    const sessionObj = JSON.parse(session);

    if (sessionObj && sessionObj.isInfoReading) {
      this.isInfoReading = sessionObj.isInfoReading;
    }

    if (sessionObj && sessionObj.address) {
      this.address = sessionObj.address;
      this.sessionType = sessionObj.sessionType;
      this.isAuthorized = true;

      this.stores.exchange.transaction.oneAddress = this.address;

      this.getSecretBalance();
    }
 */
  }

  @action public setInfoReading() {
    this.isInfoReading = true;
    this.syncLocalStorage();
  }

  @action public async signIn() {
    if (this.isKeplrWallet) {
      try {
        await this.keplrWallet.enable(this.chainId);
      } catch (error) {
        console.error(error);
      }

      this.keplrOfflineSigner = (window as any).getOfflineSigner(this.chainId);
      const accounts = await this.keplrOfflineSigner.getAccounts();
      this.address = accounts[0].address;
      this.isAuthorized = true;

      this.cosmJS = new SigningCosmWasmClient(
        'https://bootstrap.secrettestnet.io/',
        this.address,
        this.keplrOfflineSigner,
      );
    }
  }

  @action public getBalances = async () => {
    if (this.address) {
      try {
        const account = await this.cosmJS.getAccount(this.address);
        this.balance = divDecimals(
          account.balance.filter(x => x.denom === 'uscrt')[0].amount,
          6,
        );

        /* 
        let res = await getHmyBalance(this.address);
        this.balance = res && res.result;

        if (this.hrc20Address) {
          const hrc20Balance = await hmyMethodsERC20.checkHmyBalance(
            this.hrc20Address,
            this.address,
          );

          this.hrc20Balance = divDecimals(
            hrc20Balance,
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

  @action public getSecretBalance = async () => {
    if (this.address) {
      const account = await this.cosmJS.getAccount(this.address);
      this.balance = divDecimals(
        account.balance.filter(x => x.denom === 'uscrt')[0].amount,
        6,
      );
    }
  };

  @action public signOut() {
    if (this.isKeplrWallet) {
      this.isAuthorized = false;

      return this.keplrWallet
        .forgetIdentity()
        .then(() => {
          this.sessionType = null;
          this.address = null;
          this.isAuthorized = false;

          // this.balanceGem = '0';
          // this.balanceDai = '0';
          // this.balance = '0';
          //
          // this.vat = { ink: '0', art: '0' };

          this.syncLocalStorage();

          return Promise.resolve();
        })
        .catch(err => {
          console.error(err.message);
        });
    }
  }

  private syncLocalStorage() {
    localStorage.setItem(
      'harmony_session',
      JSON.stringify({
        address: this.address,
        sessionType: this.sessionType,
        isInfoReading: this.isInfoReading,
      }),
    );
  }

  @action public signTransaction(txn: any) {
    if (this.sessionType === 'mathwallet' && this.isKeplrWallet) {
      return this.keplrWallet.signTransaction(txn);
    }
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

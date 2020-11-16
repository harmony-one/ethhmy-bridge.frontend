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

const sETH = 'secret1k0jntykt7e4g3y88ltc60czgjuqdy4c9e8fzek';
const sTUSD = 'secret1psm5jn08l2ms7sef2pxywr42fa8pay877vpg68';
const sYEENUS = 'secret17nfn68fdkvvplr8s0tu7qkhxfw08j7rwne5sl2';

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

  @observable public balance_SCRT: string = '0';
  @observable public balance_sETH: string = '0';
  @observable public balance_sTUSD: string = '0';
  @observable public balance_sYEENUS: string = '0';
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

    // Setup Keplr wallet
    new Promise((accept, _reject) => {
      // 1. Every one second, check if Keplr was injected to the page
      const keplrCheckInterval = setInterval(async () => {
        this.isKeplrWallet =
          !!(window as any).keplr && !!(window as any).getOfflineSigner;
        this.keplrWallet = (window as any).keplr;

        if (this.isKeplrWallet) {
          // 2. Keplr is present, stop checking and continue to setup
          clearInterval(keplrCheckInterval);
          accept();
        }
      }, 1000);
    }).then(async () => {
      // 3. Keplr is present, setup Secret Network and SNIP20s
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

        // Add SNIP20s to this wallet
        await this.keplrWallet.suggestToken(this.chainId, sETH);
        await this.keplrWallet.suggestToken(this.chainId, sTUSD);
        await this.keplrWallet.suggestToken(this.chainId, sYEENUS);
      } catch (error) {
        console.error(error);
      }
    });

    setInterval(() => this.getBalances(), 5 * 1000);

    this.getRates();

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
        const scrtAccount = await this.cosmJS.getAccount(this.address);
        this.balance_SCRT = divDecimals(
          scrtAccount.balance.filter(x => x.denom === 'uscrt')[0].amount,
          6,
        );

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
      this.balance_SCRT = divDecimals(
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

import { action, observable } from 'mobx';
import { IStores } from 'stores';
import { statusFetching } from '../constants';
import { getHmyBalance, hmyMethodsERC20, hmyMethodsBUSD, hmyMethodsLINK } from '../blockchain-bridge';
import { StoreConstructor } from './core/StoreConstructor';
import * as agent from 'superagent';
import { IOperation } from './interfaces';

const defaults = {};

export class UserStoreEx extends StoreConstructor {
  public stores: IStores;
  @observable public isAuthorized: boolean;
  public status: statusFetching;
  redirectUrl: string;

  private onewallet: any;
  @observable public isOneWallet = false;

  @observable public sessionType: 'mathwallet' | 'ledger' | 'wallet';
  @observable public address: string;

  @observable public balance: string = '0';
  @observable public hmyBUSDBalance: string = '0';
  @observable public hmyLINKBalance: string = '0';

  @observable public hmyBUSDBalanceManager: number = 0;
  @observable public hmyLINKBalanceManager: number = 0;

  @observable public oneRate = 0;
  @observable public ethRate = 0;

  @observable public hrc20Address = '';
  @observable public hrc20Balance = '';

  constructor(stores) {
    super(stores);

    setInterval(async () => {
      // @ts-ignore
      this.isOneWallet = window.onewallet && window.onewallet.isOneWallet;
      // @ts-ignore
      this.onewallet = window.onewallet;

      // await this.getBalances();
      // await this.getOneBalance();
    }, 3000);

    setInterval(() => this.getBalances(), 3 * 1000);

    this.getRates();

    // @ts-ignore
    this.isOneWallet = window.onewallet && window.onewallet.isOneWallet;
    // @ts-ignore
    this.onewallet = window.onewallet;

    const session = localStorage.getItem('harmony_session');

    const sessionObj = JSON.parse(session);

    if (sessionObj && sessionObj.address) {
      this.address = sessionObj.address;
      this.sessionType = sessionObj.sessionType;
      this.isAuthorized = true;

      this.stores.exchange.transaction.oneAddress = this.address;

      this.getOneBalance();
    }
  }

  @action public signIn() {
    return this.onewallet
      .getAccount()
      .then(account => {
        this.sessionType = `mathwallet`;
        this.address = account.address;
        this.isAuthorized = true;

        this.stores.exchange.transaction.oneAddress = this.address;

        this.syncLocalStorage();

        this.getOneBalance();

        return Promise.resolve();
      })
      .catch(e => {
        this.onewallet.forgetIdentity();
      });
  }

  @action public getBalances = async () => {
    if (this.address) {
      try {
        let res = await getHmyBalance(this.address);
        this.balance = res && res.result;

        if (this.hrc20Address) {
          this.hrc20Balance = await hmyMethodsERC20.checkHmyBalance(
            this.hrc20Address,
            this.address,
          );
        }

        this.hmyBUSDBalance = await hmyMethodsBUSD.checkHmyBalance(
          this.address,
        );
        this.hmyLINKBalance = await hmyMethodsLINK.checkHmyBalance(
          this.address,
        );
      } catch (e) {
        console.error(e);
      }
    }

    try {
      const hmyBUSDBalanceManager = await hmyMethodsBUSD.totalSupply();

      this.hmyBUSDBalanceManager = Number(hmyBUSDBalanceManager);

      const hmyLINKBalanceManager = await hmyMethodsLINK.checkHmyBalance(
        process.env.HMY_LINK_MANAGER_CONTRACT,
      );
      this.hmyLINKBalanceManager = 10000 - Number(hmyLINKBalanceManager);
    } catch (e) {
      console.error(e);
    }
  };

  @action public getOneBalance = async () => {
    if (this.address) {
      let res = await getHmyBalance(this.address);
      this.balance = res && res.result;
    }
  };

  @action public signOut() {
    if (this.isOneWallet) {
      this.isAuthorized = false;

      return this.onewallet
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
      }),
    );
  }

  @action public signTransaction(txn: any) {
    if (this.sessionType === 'mathwallet' && this.isOneWallet) {
      return this.onewallet.signTransaction(txn);
    }
  }

  public saveRedirectUrl(url: string) {
    if (!this.isAuthorized && url) {
      this.redirectUrl = url;
    }
  }

  @action public async getRates() {
    let res = await agent.get<{ body: IOperation }>(
      'https://api.binance.com/api/v1/ticker/24hr?symbol=ONEUSDT',
    );

    this.oneRate = res.body.lastPrice;

    res = await agent.get<{ body: IOperation }>(
      'https://api.binance.com/api/v1/ticker/24hr?symbol=ETHUSDT',
    );

    this.ethRate = res.body.lastPrice;
  }
}

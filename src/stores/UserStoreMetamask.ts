import { action, observable } from 'mobx';
import { statusFetching } from '../constants';
import detectEthereumProvider from '@metamask/detect-provider';
import { StoreConstructor } from './core/StoreConstructor';
import {
  getEthBalance,
  ethMethodsERC20,
  hmyMethodsERC20,
  ethMethodsLINK,
  ethMethodsBUSD,
} from '../blockchain-bridge';
import { divDecimals } from '../utils';

const defaults = {};

export interface IERC20Token {
  name: string;
  symbol: string;
  decimals: string;
  erc20Address: string;
}

export class UserStoreMetamask extends StoreConstructor {
  @observable public isAuthorized: boolean;
  @observable error: string = '';

  public status: statusFetching;

  @observable public isMetaMask = false;
  private provider: any;

  @observable public ethAddress: string;
  @observable public ethBalance: string = '0';
  @observable public ethBUSDBalance: string = '0';
  @observable public ethLINKBalance: string = '0';

  @observable erc20Address: string = '';
  @observable erc20TokenDetails: IERC20Token;
  @observable erc20Balance: string = '';

  constructor(stores) {
    super(stores);

    setInterval(() => this.getBalances(), 3 * 1000);

    const session = localStorage.getItem('harmony_metamask_session');

    const sessionObj = JSON.parse(session);

    if (sessionObj && sessionObj.ethAddress) {
      this.signIn();
    }

    if (sessionObj && sessionObj.erc20Address) {
      this.setToken(sessionObj.erc20Address);
    }
  }

  @action.bound
  handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
      return this.setError('Please connect to MetaMask');
    } else {
      this.ethAddress = accounts[0];
      this.syncLocalStorage();
    }
  }

  @action.bound
  setError(error: string) {
    this.error = error;
    this.isAuthorized = false;
  }

  @action.bound
  public async signOut() {
    this.isAuthorized = false;
    this.ethBalance = '0';
    this.ethAddress = '';
    this.ethLINKBalance = '0';
    this.ethBUSDBalance = '0';

    this.syncLocalStorage();

    // await this.provider.request({
    //   method: 'wallet_requestPermissions',
    //   params: [
    //     {
    //       eth_accounts: {},
    //     },
    //   ],
    // });
  }

  @action.bound
  public async signIn(isNew = false) {
    try {
      this.error = '';

      const provider = await detectEthereumProvider();

      // @ts-ignore
      if (provider !== window.ethereum) {
        console.error('Do you have multiple wallets installed?');
      }

      if (!provider) {
        return this.setError('Metamask not found');
      }

      this.provider = provider;

      this.provider.on('accountsChanged', this.handleAccountsChanged);

      this.provider.on('disconnect', () => {
        this.isAuthorized = false;
        this.ethAddress = null;
      });

      this.provider
        .request({ method: 'eth_requestAccounts' })
        .then(async params => {
          this.handleAccountsChanged(params);

          if (isNew) {
            await this.provider.request({
              method: 'wallet_requestPermissions',
              params: [
                {
                  eth_accounts: {},
                },
              ],
            });
          }

          this.isAuthorized = true;
        })
        .catch(err => {
          if (err.code === 4001) {
            this.isAuthorized = false;
            this.ethAddress = null;
            this.syncLocalStorage();
            return this.setError('Please connect to MetaMask.');
          } else {
            console.error(err);
          }
        });
    } catch (e) {
      return this.setError(e.message);
    }
  }

  private syncLocalStorage() {
    localStorage.setItem(
      'harmony_metamask_session',
      JSON.stringify({
        ethAddress: this.ethAddress,
        erc20Address: this.erc20Address,
      }),
    );
  }

  @action.bound public getBalances = async () => {
    if (this.ethAddress) {
      try {
        if (this.erc20Address) {
          const erc20Balance = await ethMethodsERC20.checkEthBalance(
            this.erc20Address,
            this.ethAddress,
          );

          this.erc20Balance = divDecimals(
            erc20Balance,
            this.erc20TokenDetails.decimals,
          );
        }

        let res = 0;

        res = await ethMethodsLINK.checkEthBalance(this.ethAddress);
        this.ethLINKBalance = divDecimals(res, 18);

        res = await ethMethodsBUSD.checkEthBalance(this.ethAddress);
        this.ethBUSDBalance = divDecimals(res, 18);

        this.ethBalance = await getEthBalance(this.ethAddress);
      } catch (e) {
        console.error(e);
      }
    }
  };

  @action.bound public setToken = async (erc20Address: string) => {
    this.erc20TokenDetails = null;
    this.erc20Address = '';
    this.stores.user.hrc20Address = '';

    this.erc20TokenDetails = await ethMethodsERC20.tokenDetails(erc20Address);
    this.erc20Address = erc20Address;

    const address = await hmyMethodsERC20.getMappingFor(erc20Address);

    if (!!Number(address)) {
      this.stores.user.hrc20Address = address;
      this.syncLocalStorage();
    } else {
      this.stores.user.hrc20Address = '';
    }
  };

  @action public reset() {
    Object.assign(this, defaults);
  }
}

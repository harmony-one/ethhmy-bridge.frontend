import { action, observable } from 'mobx';
import { statusFetching } from '../constants';
import detectEthereumProvider from '@metamask/detect-provider';
import { StoreConstructor } from './core/StoreConstructor';
import {
  getEthBalance,
  ethMethodsBUSD,
  ethMethodsLINK,
} from '../blockchain-bridge';

const defaults = {};

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

  constructor(stores) {
    super(stores);

    setInterval(() => this.getBalances(), 3 * 1000);

    this.signIn();
  }

  @action.bound
  handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
      return this.setError('Please connect to MetaMask');
    } else {
      this.ethAddress = accounts[0];
    }
  }

  @action.bound
  setError(error: string) {
    this.error = error;
    this.isAuthorized = false;
  }

  @action.bound
  public async signIn() {
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
      this.isAuthorized = true;

      this.provider.on('accountsChanged', this.handleAccountsChanged);

      this.provider.on('disconnect', () => {
        this.isAuthorized = false;
        this.ethAddress = null;
      });

      this.provider
        .request({ method: 'eth_requestAccounts' })
        .then(this.handleAccountsChanged)
        .catch(err => {
          if (err.code === 4001) {
            return this.setError('Please connect to MetaMask.');
          } else {
            console.error(err);
          }
        });
    } catch (e) {
      return this.setError(e.message);
    }
  }

  @action.bound public getBalances = async () => {
    if (this.ethAddress) {
      try {
        this.ethBUSDBalance = await ethMethodsBUSD.checkEthBalance(
          this.ethAddress,
        );

        this.ethLINKBalance = await ethMethodsLINK.checkEthBalance(
          this.ethAddress,
        );

        this.ethBalance = await getEthBalance(this.ethAddress);
      } catch (e) {
        console.error(e);
      }
    }
  };

  @action public reset() {
    Object.assign(this, defaults);
  }
}

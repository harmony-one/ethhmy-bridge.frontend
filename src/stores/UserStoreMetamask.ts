import { action, observable } from 'mobx';
import { statusFetching } from '../constants';
import detectEthereumProvider from '@metamask/detect-provider';
import { StoreConstructor } from './core/StoreConstructor';
import { getEthBalance, getErc20Balance, ethMethodsERC20 } from '../blockchain-bridge';
import { divDecimals, formatWithSixDecimals } from '../utils';
import Web3 from 'web3';

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
  @observable public ethBalance: string = '';
  @observable public ethBalanceMin: string = '';
  @observable public balanceToken: { [key: string]: string } = {};
  @observable public balanceTokenMin: { [key: string]: string } = {};

  @observable erc20Address: string = '';
  @observable erc20TokenDetails: IERC20Token;
  @observable erc20Balance: string = '';
  @observable erc20BalanceMin: string = '';

  constructor(stores) {
    super(stores);

    this.getBalances();
    setInterval(() => this.getBalances(), 5000);

    const session = localStorage.getItem('metamask_session');

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
      this.ethAddress = Web3.utils.toChecksumAddress(accounts[0]);
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
    this.ethBalance = '';
    this.ethBalanceMin = '';
    this.ethAddress = '';
    this.balanceToken = {};

    this.syncLocalStorage();
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

      this.provider.autoRefreshOnNetworkChange = false;

      this.provider.on('accountsChanged', this.handleAccountsChanged);

      this.provider.on('chainChanged', () => {
        //document.location.reload()
      });

      this.provider.on('disconnect', () => {
        this.isAuthorized = false;
        this.ethAddress = null;
      });

      try {
        if (isNew) {
          await new Promise((accept, reject) =>
            this.provider.send(
              {
                method: 'wallet_requestPermissions',
                params: [
                  {
                    eth_accounts: {},
                  },
                ],
              },
              err => (err ? reject(err) : accept()),
            ),
          );
        }

        this.isAuthorized = true;

        const params = await this.provider.request({
          method: 'eth_requestAccounts',
        });
        this.handleAccountsChanged(params);
      } catch (err) {
        if (err.code === 4001) {
          this.isAuthorized = false;
          this.ethAddress = null;
          this.syncLocalStorage();
          return this.setError('Please connect to MetaMask.');
        } else {
          console.error(err);
        }
      }
    } catch (e) {
      return this.setError(e.message);
    }
  }

  private syncLocalStorage() {
    localStorage.setItem(
      'metamask_session',
      JSON.stringify({
        ethAddress: this.ethAddress,
        erc20Address: this.erc20Address,
      }),
    );
  }

  @action.bound public getBalances = async () => {
    if (this.ethAddress) {
      for (const token of this.stores.tokens.allData) {
        if (token.src_coin === 'Ethereum') {
          continue;
        }
        getErc20Balance(this.ethAddress, token.src_address).then(b => {
          this.balanceToken[token.src_coin] = formatWithSixDecimals(divDecimals(b, token.decimals));
        });
        this.balanceTokenMin[token.src_coin] = token.display_props.min_to_scrt;
      }

      getEthBalance(this.ethAddress).then(b => {
        this.ethBalance = formatWithSixDecimals(b);
      });
      this.ethBalanceMin = this.balanceTokenMin['Ethereum'];
    }
  };

  @action.bound public setToken = async (erc20Address: string, tokens?) => {
    this.erc20TokenDetails = null;
    this.erc20Address = '';
    this.erc20Balance = '';
    this.erc20BalanceMin = '';
    this.stores.user.snip20Address = '';
    this.stores.user.snip20Balance = '';
    this.stores.user.snip20BalanceMin = '';

    this.erc20TokenDetails = await ethMethodsERC20.tokenDetails(erc20Address);
    this.erc20Address = erc20Address;
    this.erc20Balance = divDecimals(
      await getErc20Balance(this.ethAddress, erc20Address),
      this.erc20TokenDetails.decimals,
    );
    this.erc20BalanceMin = this.stores.tokens.allData.find(
      t => t.src_address === erc20Address,
    ).display_props.min_to_scrt;

    if (tokens) {
      const token = tokens.allData.find(t => t.src_address === this.erc20Address);
      if (token.dst_address) {
        this.stores.user.snip20Address = token.dst_address;
        this.stores.user.snip20Balance = this.stores.user.balanceToken[token.src_coin];
        this.stores.user.snip20BalanceMin = this.stores.user.balanceTokenMin[token.src_coin];
      }
    }
  };

  @action public reset() {
    Object.assign(this, defaults);
  }
}

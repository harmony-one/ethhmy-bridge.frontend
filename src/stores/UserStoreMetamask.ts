import { action, autorun, computed, observable } from 'mobx';
import { statusFetching } from '../constants';
import detectEthereumProvider from '@metamask/detect-provider';
import { StoreConstructor } from './core/StoreConstructor';
import {
  getExNetworkMethods,
  hmyMethodsBEP20,
  hmyMethodsERC20,
  hmyMethodsERC721,
} from '../blockchain-bridge';
import { divDecimals } from '../utils';
import { EXCHANGE_MODE, NETWORK_TYPE, TOKEN } from './interfaces';
import Web3 from 'web3';
import { NETWORK_BASE_TOKEN, NETWORK_ERC20_TOKEN, NETWORK_NAME } from './names';
import { isAddressEqual } from './UserStore';

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

  @observable metamaskChainId = 0;

  constructor(stores) {
    super(stores);

    setInterval(() => this.getBalances(), 3 * 1000);

    const session = localStorage.getItem('harmony_metamask_session');

    const sessionObj = JSON.parse(session);

    if (sessionObj && sessionObj.ethAddress) {
      this.signIn();
    }

    if (sessionObj && sessionObj.erc20Address && sessionObj.token) {
      const path = this.stores.routing.location.pathname.split('/');

      if (path.length && sessionObj.token === path[1]) {
        switch (sessionObj.token) {
          case TOKEN.ERC20:
            this.setToken(sessionObj.erc20Address);
            break;
          case TOKEN.ONE:
            setTimeout(() => {
              this.stores.user.setHRC20Mapping(sessionObj.hrc20Address, true);
            }, 1000);
            break;
          case TOKEN.HRC20:
            setTimeout(() => {
              this.stores.user.setHRC20Mapping(sessionObj.hrc20Address);
            }, 1000);
            break;
          case TOKEN.ERC721:
            this.setERC721Token(sessionObj.erc20Address);
            break;
        }
      }
    }

    autorun(() => {
      if (this.isNetworkActual) {
        this.signIn();
      }
    });
  }

  @computed public get isNetworkActual() {
    console.log('metamaskChainId', this.metamaskChainId);

    switch (process.env.NETWORK) {
      case 'testnet':
        switch (this.stores.exchange.network) {
          case NETWORK_TYPE.ETHEREUM:
            return Number(this.metamaskChainId) === 42;
          case NETWORK_TYPE.BINANCE:
            return Number(this.metamaskChainId) === 97;
        }

      case 'mainnet':
        switch (this.stores.exchange.network) {
          case NETWORK_TYPE.ETHEREUM:
            return Number(this.metamaskChainId) === 1;
          case NETWORK_TYPE.BINANCE:
            return Number(this.metamaskChainId) === 56;
        }
    }

    return false;
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

      this.provider.on(
        'chainIdChanged',
        chainId => (this.metamaskChainId = chainId),
      );
      this.provider.on(
        'chainChanged',
        chainId => (this.metamaskChainId = chainId),
      );
      this.provider.on(
        'networkChanged',
        chainId => (this.metamaskChainId = chainId),
      );

      this.provider
        .request({ method: 'eth_requestAccounts' })
        .then(async params => {
          this.handleAccountsChanged(params);

          // @ts-ignore
          const web3 = new Web3(window.ethereum);
          this.metamaskChainId = await web3.eth.net.getId();

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

  public syncLocalStorage() {
    localStorage.setItem(
      'harmony_metamask_session',
      JSON.stringify({
        ethAddress: this.ethAddress,
        erc20Address: this.erc20Address,
        hrc20Address: this.stores.user.hrc20Address,
        token: this.stores.exchange.token,
      }),
    );
  }

  @action.bound public getBalances = async () => {
    const exNetwork = getExNetworkMethods();

    if (this.ethAddress && this.isNetworkActual) {
      try {
        if (this.erc20Address) {
          const erc20Balance = await exNetwork.ethMethodsERC20.checkEthBalance(
            this.erc20Address,
            this.ethAddress,
          );

          this.erc20Balance = divDecimals(
            erc20Balance,
            this.erc20TokenDetails.decimals,
          );
        }

        let res = 0;

        if (this.stores.exchange.network === NETWORK_TYPE.ETHEREUM) {
          res = await exNetwork.ethMethodsLINK.checkEthBalance(this.ethAddress);
          this.ethLINKBalance = divDecimals(res, 18);

          res = await exNetwork.ethMethodsBUSD.checkEthBalance(this.ethAddress);
          this.ethBUSDBalance = divDecimals(res, 18);
        }

        this.ethBalance = await exNetwork.getEthBalance(this.ethAddress);
      } catch (e) {
        console.error(e);
      }
    }
  };

  @action.bound public setToken = async (
    erc20Address: string,
    ignoreValidations = false,
  ) => {
    const exNetwork = getExNetworkMethods();

    this.erc20TokenDetails = null;
    this.erc20Address = '';
    this.erc20Balance = '0';
    this.stores.user.hrc20Address = '';
    this.stores.user.hrc20Balance = '0';

    if (!erc20Address) {
      throw new Error('Address field is empty');
    }

    if (
      this.stores.exchange.mode === EXCHANGE_MODE.ETH_TO_ONE &&
      (!this.isNetworkActual || !this.isAuthorized)
    ) {
      throw new Error(
        `Your MetaMask in on the wrong network. Please switch on ${
          NETWORK_NAME[this.stores.exchange.network]
        } ${process.env.NETWORK} and try again!`,
      );
    }

    if (
      this.stores.exchange.mode === EXCHANGE_MODE.ONE_TO_ETH &&
      ((this.stores.user.isMetamask && !this.stores.user.isNetworkActual) ||
        !this.stores.user.isAuthorized)
    ) {
      throw new Error(
        `Your MetaMask in on the wrong network. Please switch on Harmony ${process.env.NETWORK} and try again!`,
      );
    }

    if (!ignoreValidations) {
      if (
        this.stores.tokens.allData
          .filter(t => t.token === TOKEN.HRC20)
          .find(
            t =>
              isAddressEqual(t.erc20Address, erc20Address) ||
              isAddressEqual(t.hrc20Address, erc20Address),
          )
      ) {
        throw new Error('This address already using for HRC20 token wrapper');
      }

      if (
        '0x00eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'.toLowerCase() ===
        erc20Address.toLowerCase()
      ) {
        throw new Error('This address already using for Native tokens');
      }

      if (
        this.stores.tokens.allData
          .filter(t => t.token === TOKEN.ERC721)
          .find(t => isAddressEqual(t.erc20Address, erc20Address))
      ) {
        throw new Error('This address already using for ERC721 token');
      }
    }

    this.erc20Address = erc20Address;

    let address;

    if (this.stores.exchange.network === NETWORK_TYPE.ETHEREUM) {
      address = await hmyMethodsERC20.hmyMethods.getMappingFor(erc20Address);
    } else {
      address = await hmyMethodsBEP20.hmyMethods.getMappingFor(erc20Address);
    }

    if (this.stores.exchange.mode === EXCHANGE_MODE.ONE_TO_ETH && !address) {
      // throw new Error('Address not mapping');
      throw new Error(
        `Wrong token address. Use only a valid ${
          NETWORK_ERC20_TOKEN[this.stores.exchange.network]
        } token address, not HRC20 address`,
      );
    }

    try {
      this.erc20TokenDetails = await exNetwork.ethMethodsERC20.tokenDetails(
        erc20Address,
      );
    } catch (e) {
      if (this.stores.exchange.mode === EXCHANGE_MODE.ETH_TO_ONE) {
        throw new Error(
          `Wrong token address. Use only a valid ${
            NETWORK_ERC20_TOKEN[this.stores.exchange.network]
          } token address, not HRC20 address`,
        );
      }
    }

    this.erc20Address = erc20Address;

    if (!!Number(address)) {
      if (!this.erc20TokenDetails) {
        try {
          this.erc20TokenDetails = {
            ...(await hmyMethodsERC20.hmyMethods.tokenDetails(address)),
            erc20Address,
          };
        } catch (e) {
          if (this.stores.exchange.mode === EXCHANGE_MODE.ONE_TO_ETH) {
            throw new Error(
              `Wrong token address. Use only a valid ${
                NETWORK_ERC20_TOKEN[this.stores.exchange.network]
              } token address, not HRC20 address`,
            );
          }
        }
      }

      this.stores.user.hrc20Address = address;
      this.syncLocalStorage();
    } else {
      this.stores.user.hrc20Address = '';
    }
  };

  setTokenHRC20 = async (erc20Address: string) => {
    let address;

    if (this.stores.exchange.network === NETWORK_TYPE.ETHEREUM) {
      address = await hmyMethodsERC20.hmyMethods.getMappingFor(erc20Address);
    } else {
      address = await hmyMethodsBEP20.hmyMethods.getMappingFor(erc20Address);
    }

    this.erc20Address = erc20Address;

    if (!!Number(address)) {
      if (!this.erc20TokenDetails) {
        try {
          this.erc20TokenDetails = {
            ...(await hmyMethodsERC20.hmyMethods.tokenDetails(address)),
            erc20Address,
          };
        } catch (e) {
          if (this.stores.exchange.mode === EXCHANGE_MODE.ONE_TO_ETH) {
            throw new Error(
              `Wrong token address. Use only a valid ${
                NETWORK_ERC20_TOKEN[this.stores.exchange.network]
              } token address, not HRC20 address`,
            );
          }
        }
      }

      this.stores.user.hrc20Address = address;
      this.syncLocalStorage();
    } else {
      this.stores.user.hrc20Address = '';
    }
  };

  @action.bound public setERC721Token = async (erc20Address: string) => {
    const exNetwork = getExNetworkMethods();

    this.erc20TokenDetails = null;
    this.erc20Address = '';
    this.erc20Balance = '0';
    this.stores.user.hrc20Address = '';
    this.stores.user.hrc20Balance = '0';

    if (!erc20Address) {
      throw new Error('Address field is empty');
    }

    if (
      this.stores.exchange.mode === EXCHANGE_MODE.ETH_TO_ONE &&
      (!this.isNetworkActual || !this.isAuthorized)
    ) {
      throw new Error(
        `Your MetaMask in on the wrong network. Please switch on ${
          NETWORK_NAME[this.stores.exchange.network]
        } ${process.env.NETWORK} and try again!`,
      );
    }

    if (
      this.stores.exchange.mode === EXCHANGE_MODE.ONE_TO_ETH &&
      ((this.stores.user.isMetamask && !this.stores.user.isNetworkActual) ||
        !this.stores.user.isAuthorized)
    ) {
      throw new Error(
        `Your MetaMask in on the wrong network. Please switch on Harmony ${process.env.NETWORK} and try again!`,
      );
    }

    if (
      this.stores.tokens.allData
        .filter(t => t.token === TOKEN.HRC20)
        .find(t => t.erc20Address === erc20Address)
    ) {
      throw new Error('This address already using for HRC20 token wrapper');
    }

    if (
      this.stores.tokens.allData
        .filter(t => t.token === TOKEN.ERC20)
        .find(t => t.erc20Address === erc20Address)
    ) {
      throw new Error('This address already using for ERC20 token');
    }

    if (
      '0x00eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'.toLowerCase() ===
      erc20Address.toLowerCase()
    ) {
      throw new Error('This address already using for Native tokens');
    }

    const details = await exNetwork.ethMethodsERС721.tokenDetailsERC721(
      erc20Address,
    );
    this.erc20Address = erc20Address;

    this.erc20TokenDetails = { ...details, decimals: '0' };

    const address = await hmyMethodsERC721.hmyMethods.getMappingFor(
      erc20Address,
    );

    if (!!Number(address)) {
      this.stores.user.hrc20Address = address;
      this.syncLocalStorage();
    } else {
      this.stores.user.hrc20Address = '';
    }
  };

  @action.bound public setTokenDetails = (tokenDetails: IERC20Token) => {
    this.erc20TokenDetails = tokenDetails;
  };

  @action public reset() {
    Object.assign(this, defaults);
  }
}

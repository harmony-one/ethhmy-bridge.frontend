import { StoreConstructor } from './core/StoreConstructor';
import { action, autorun, computed, observable, reaction } from 'mobx';
import { NETWORK_TYPE, TOKEN } from './interfaces';
import { NETWORK_ICON } from './names';
import { tokensMainnet } from '../pages/Exchange/tokens';

export class Erc20SelectStore extends StoreConstructor {
  @observable tokenAddress;
  @observable error = '';
  @observable isLoading = false;

  constructor(stores) {
    super(stores);

    autorun(() => {
      if (stores.exchange.network) {
        this.tokenAddress = '';
        this.error = '';
      }
    });

    autorun(() => {
      if (stores.exchange.mode && this.tokenAddress) {
        this.setToken(this.tokenAddress);
      }
    });

    autorun(() => {
      if (stores.exchange.token) {
        this.tokenAddress = '';
        this.error = '';
      }
    });

    autorun(() => {
      if (stores.exchange.token === TOKEN.HRC20) {
        if (stores.user.hrc20Address) {
          this.tokenAddress = stores.user.hrc20Address;
        }
      } else {
        if (stores.userMetamask.erc20Address) {
          this.tokenAddress = stores.userMetamask.erc20Address;
        }
      }
    });

    reaction(
      () =>
        stores.userMetamask.isNetworkActual && stores.userMetamask.isAuthorized,
      () =>
        this.tokenAddress &&
        setTimeout(() => this.setToken(this.tokenAddress), 500),
    );

    reaction(
      () => stores.user.isMetamask && stores.user.isNetworkActual,
      () =>
        this.tokenAddress &&
        setTimeout(() => this.setToken(this.tokenAddress), 500),
    );

    reaction(
      () => !stores.user.isMetamask && stores.user.isAuthorized,
      () =>
        this.tokenAddress &&
        setTimeout(() => this.setToken(this.tokenAddress), 500),
    );
  }

  @action.bound
  setToken = async (value: string, ignoreValidations = false) => {
    this.tokenAddress = value;
    this.error = '';
    this.isLoading = true;

    try {
      switch (this.stores.exchange.token) {
        case TOKEN.ERC721:
          await this.stores.userMetamask.setERC721Token(value);
          break;

        case TOKEN.ERC20:
          await this.stores.userMetamask.setToken(value, ignoreValidations);
          break;

        case TOKEN.HRC20:
          await this.stores.user.setHRC20Mapping(value, ignoreValidations);
          break;
      }
    } catch (e) {
      this.error = e.message;
    }

    this.isLoading = false;
  };

  @computed
  get isOk() {
    return !this.error && !this.isLoading && !!this.tokenAddress;
  }

  @computed
  get tokensList() {
    // if (
    //   this.stores.exchange.network === NETWORK_TYPE.ETHEREUM &&
    //   process.env.NETWORK !== 'testnet'
    // ) {
    //   return tokensMainnet;
    // }

    if (this.stores.exchange.token === TOKEN.HRC20) {
      return this.stores.tokens.allData
        .filter(t => !['ONE'].includes(t.symbol))
        .filter(t => t.network === this.stores.exchange.network)
        .filter(t => t.type === this.stores.exchange.token)
        .map(t => ({
          address: t.hrc20Address,
          label: `${t.name} (${t.symbol})`,
          image: NETWORK_ICON[t.network],
        }));
    }

    const { network } = this.stores.exchange;

    const filteredTokens = this.stores.tokens.allData
      .filter(t =>
        network === NETWORK_TYPE.ETHEREUM
          ? !['BUSD', 'LINK', 'ETH'].includes(t.symbol) &&
            !tokensMainnet.find(
              tm => tm.address.toLowerCase() === t.erc20Address.toLowerCase(),
            )
          : t.symbol !== 'BNB',
      )
      .filter(t => t.network === this.stores.exchange.network)
      .filter(t => t.type === this.stores.exchange.token)
      .map(t => ({
        address: t.erc20Address,
        href: '',
        label: `${t.name} (${t.symbol})`,
        image: NETWORK_ICON[t.network],
      }));

    return network === NETWORK_TYPE.ETHEREUM
      ? tokensMainnet.concat(filteredTokens)
      : filteredTokens;
  }
}

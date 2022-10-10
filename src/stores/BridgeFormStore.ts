import { StoreConstructor } from './core/StoreConstructor';
import { action, computed, observable } from 'mobx';
import { EXCHANGE_MODE, NETWORK_TYPE, TOKEN } from './interfaces';
import { tokenConfig } from '../pages/EthBridge/constants';
import { EXCHANGE_STEPS } from './Exchange';
import { send1LINK } from 'services/layerzero';
import { dark } from 'grommet';

interface BridgeFormData {
  token: TOKEN;
  amount: string;
  exchangeMode: EXCHANGE_MODE;
  address: string;
  network: NETWORK_TYPE;
  approveAmount: string;
}

export class BridgeFormStore extends StoreConstructor {
  defaultData: BridgeFormData = {
    token: TOKEN.LINK,
    amount: '0',
    exchangeMode: EXCHANGE_MODE.ETH_TO_ONE,
    address: '',
    network: NETWORK_TYPE.ETHEREUM,
    approveAmount: '0',
  };

  @observable bridgeStep: EXCHANGE_STEPS = EXCHANGE_STEPS.BASE;

  @observable data = { ...this.defaultData };
  // @observable token: TOKEN = TOKEN.LINK;
  // @observable amount: string = '';
  // @observable exchangeMode: EXCHANGE_MODE = EXCHANGE_MODE.ETH_TO_ONE;
  // @observable address: string = '';
  // @observable network: NETWORK_TYPE = NETWORK_TYPE.ETHEREUM;

  @action.bound
  setExchangeMode(exchangeMode: EXCHANGE_MODE) {
    this.data.exchangeMode = exchangeMode;
  }

  @action.bound
  toggleExchangeMode() {
    if (this.data.exchangeMode === EXCHANGE_MODE.ONE_TO_ETH) {
      this.data.exchangeMode = EXCHANGE_MODE.ETH_TO_ONE;
    } else {
      this.data.exchangeMode = EXCHANGE_MODE.ONE_TO_ETH;
    }
  }

  @action.bound
  setNetwork(network: NETWORK_TYPE) {
    this.data.network = network;
  }

  @action.bound
  setToken(token: TOKEN) {
    this.data.token = token;
  }

  @computed
  get tokenConfig() {
    return tokenConfig[this.data.token];
  }

  @action.bound
  setAddress(address: string) {
    this.data.address = address;
  }

  @action.bound
  goToBaseState() {
    this.bridgeStep = EXCHANGE_STEPS.BASE;
  }

  @action.bound
  goToApproveState() {
    // TODO: validation
    this.data.approveAmount = this.data.amount;
    this.bridgeStep = EXCHANGE_STEPS.APPROVE;
  }

  @action.bound
  goToConfirmState() {
    // TODO: validation
    this.bridgeStep = EXCHANGE_STEPS.CONFIRMATION;
  }

  @action.bound
  async goToSendingState() {
    try {
      const res = await send1LINK({
        amount: this.data.amount,
        approveAmount: this.data.approveAmount,
        sourceAddress: this.stores.userMetamask.ethAddress,
        destinationAddress: this.data.address,
      });
      console.log('### res', res);
      this.bridgeStep = EXCHANGE_STEPS.SENDING;
    } catch (ex) {
      console.log('### ex', ex);
    }
  }
}

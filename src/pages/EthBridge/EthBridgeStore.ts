import { observable } from 'mobx';

export class EthBridgeStore {
  @observable formRef = null;
  @observable addressValidationError = null;
}

export const ethBridgeStore = new EthBridgeStore();

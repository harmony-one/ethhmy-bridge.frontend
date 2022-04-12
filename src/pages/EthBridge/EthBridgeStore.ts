import { observable } from 'mobx';

export class EthBridgeStore {
  @observable form = null;
  @observable addressValidationError = null;
}

export const ethBridgeStore = new EthBridgeStore();

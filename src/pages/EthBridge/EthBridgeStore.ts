import { observable } from 'mobx';

export class EthBridgeStore {
  @observable formRefStepBASE = null;
  @observable formRefStepAPPROVE = null;
  @observable addressValidationError = null;
}

export const ethBridgeStore = new EthBridgeStore();

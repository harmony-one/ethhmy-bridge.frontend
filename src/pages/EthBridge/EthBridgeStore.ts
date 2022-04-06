import { observable } from 'mobx';

export class EthBridgeStore {
  @observable formRefStepBASE = null;
  @observable formRefStepBASEAddress = 0;
  @observable formRefStepAPPROVE = null;
  @observable addressValidationError = null;
}

export const ethBridgeStore = new EthBridgeStore();

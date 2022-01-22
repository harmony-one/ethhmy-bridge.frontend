import { IStores } from 'stores';
import { StoreConstructor } from './core/StoreConstructor';
import { action, observable } from 'mobx';
import { getUIConfig } from '../services';

export class UIConfig extends StoreConstructor {
  public stores: IStores;

  @observable assetsBlackList = [];
  @observable blockerDisclaimers = [];

  constructor(stores: IStores) {
    super(stores);

    setInterval(async () => {
      await this.init();
    }, 10000);
  }

  @action.bound
  init = async () => {
    const config = await getUIConfig();

    this.assetsBlackList = config.assetsBlackList.map(a => a.toLowerCase());
    this.blockerDisclaimers = config.blockers;
  };
}

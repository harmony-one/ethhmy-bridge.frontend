import { IStores } from 'stores';

export class StoreConstructor {
  public stores: IStores;

  constructor(stores: IStores) {
    this.stores = stores;
  }
}
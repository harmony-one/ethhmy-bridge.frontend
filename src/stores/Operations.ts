import { IOperation } from './interfaces';
import { IStores } from './index';
import * as services from 'services';
import { ListStoreConstructor } from './core/ListStoreConstructor';

export class Operations extends ListStoreConstructor<IOperation> {
  constructor(stores: IStores) {
    super(stores, services.getOperations, { pollingInterval: 10000 });
  }
}

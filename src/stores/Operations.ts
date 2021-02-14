import { IOperation, ISwap } from './interfaces';
import { IStores } from './index';
import * as services from 'services';
import { ListStoreConstructor } from './core/ListStoreConstructor';
import { computed } from 'mobx';

export class Operations extends ListStoreConstructor<ISwap> {
  constructor(stores: IStores) {
    super(stores, services.getOperations, {
      pollingInterval: 20000,
      isLocal: true,
      paginationData: { pageSize: 10 },
      // sorter: 'created_on, asc',
    });
  }
}

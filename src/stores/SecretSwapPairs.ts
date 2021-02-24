import { ISecretSwapPair } from './interfaces';
import { IStores } from './index';
import * as services from '../services';
import { ListStoreConstructor } from './core/ListStoreConstructor';

export class SecretSwapPairs extends ListStoreConstructor<ISecretSwapPair> {
  constructor(stores: IStores) {
    super(stores, () => services.getSecretSwapPairs({ page: 0, size: 1000 }), {
      pollingInterval: 30000,
      isLocal: true,
      paginationData: { pageSize: 100 },
      sorter: 'none',
      sorters: {},
    });
  }
}

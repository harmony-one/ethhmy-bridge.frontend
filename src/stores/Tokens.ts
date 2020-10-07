import { ITokenInfo } from './interfaces';
import { IStores } from './index';
import * as services from 'services';
import { ListStoreConstructor } from './core/ListStoreConstructor';

export class Tokens extends ListStoreConstructor<ITokenInfo> {
  constructor(stores: IStores) {
    super(stores, services.getTokensInfo, {
      pollingInterval: 10000,
      paginationData: { pageSize: 30 },
    });
  }
}

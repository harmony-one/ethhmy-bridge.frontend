import { ITokenInfo, NETWORK_TYPE } from './interfaces';
import { IStores } from './index';
import * as services from 'services';
import { ListStoreConstructor } from './core/ListStoreConstructor';
import { computed, observable } from 'mobx';

export class Tokens extends ListStoreConstructor<ITokenInfo> {
  constructor(stores: IStores) {
    super(stores, () => services.getTokensInfo({ page: 0, size: 1000 }), {
      pollingInterval: 30000,
      isLocal: true,
      paginationData: { pageSize: 100 },
      sorter: 'totalLockedUSD, asc',
      sorters: {
        totalLockedUSD: 'asc',
      },
    });
  }

  @observable selectedNetwork: NETWORK_TYPE;

  @computed get totalLockedUSD() {
    return this.data
      .filter(a =>
        this.selectedNetwork ? a.network === this.selectedNetwork : true,
      )
      .reduce((acc, v) => acc + Number(v.totalLockedUSD), 0);
  }
}

import { ITokenInfo, NETWORK_TYPE } from './interfaces';
import { IStores } from './index';
import * as services from 'services';
import { SetListStoreConstructor } from './core/SetListStoreConstructor';
import { computed, observable } from 'mobx';

export class Assets extends SetListStoreConstructor<any> {
  constructor(stores: IStores) {
    super(stores, {
      pollingInterval: 30000,
      isLocal: true,
      paginationData: { pageSize: 200 },
      sorter: 'totalLockedUSD, asc',
      sorters: {
        totalLockedUSD: 'asc',
      },
    });
  }

  @observable selectedNetwork: NETWORK_TYPE;

  @computed get totalLockedUSD() {
    return this.allData
      .filter(a =>
        this.selectedNetwork ? a.network === this.selectedNetwork : true,
      )
      .reduce((acc, v) => acc + Number(v.totalLockedUSD), 0);
  }
}

import { IRewardPool } from './interfaces';
import { IStores } from './index';
import * as services from 'services';
import { ListStoreConstructor } from './core/ListStoreConstructor';

export class Rewards extends ListStoreConstructor<IRewardPool> {
  constructor(stores: IStores) {
    super(stores, () => services.getRewardsInfo({ page: 0, size: 1000 }), {
      pollingInterval: 30000,
      isLocal: true,
      paginationData: { pageSize: 100 },
      sorter: 'none',
      //sorter: 'none',
      sorters: {},
      // sorters: {
      //   totalLockedUSD: 'asc',
      // },
    });
  }
}

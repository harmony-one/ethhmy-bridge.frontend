import { ITokenInfo, NETWORK_TYPE } from './interfaces';
import { IStores } from './index';
import * as services from 'services';
import { ListStoreConstructor } from './core/ListStoreConstructor';
import { computed, observable } from 'mobx';
import * as _ from 'lodash';
import { tokensConfigs } from '../config';

export class Tokens extends ListStoreConstructor<ITokenInfo> {
  @observable fullTokensList = [];

  constructor(stores: IStores) {
    super(
      stores,
      () =>
        Promise.resolve({
          content: tokensConfigs,
          currentPage: 0,
          totalPages: 1,
          totalElements: tokensConfigs.length,
          pageSize: tokensConfigs.length,
        }),
      {
        pollingInterval: 30000,
        isLocal: true,
        paginationData: { pageSize: tokensConfigs.length },
        sorter: 'totalLockedUSD, asc',
        sorters: {
          totalLockedUSD: 'asc',
        },
      },
    );

    this.fullTokensList = tokensConfigs;
  }

  @observable selectedNetwork: NETWORK_TYPE;

  hasLiquidity(address: string) {
    const token = this.allData.find(
      token => token.erc20Address.toUpperCase() === address.toUpperCase(),
    );

    if (!token) {
      return false;
    }

    return Number(token.totalLockedUSD) > 10000;
  }

  getMappedAddress(address: string): string {
    const token = this.allData.find(
      token => token.erc20Address.toUpperCase() === address.toUpperCase(),
    );

    if (!token) {
      return '';
    }

    return token.hrc20Address;
  }

  @computed get totalLockedUSD() {
    return this.data
      .filter(a =>
        this.selectedNetwork ? a.network === this.selectedNetwork : true,
      )
      .reduce((acc, v) => acc + Number(v.totalLockedUSD), 0);
  }
}

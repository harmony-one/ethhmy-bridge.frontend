import { IIdentityTokenInfo, ITokenInfo, NETWORK_TYPE } from './interfaces';
import { IStores } from './index';
import * as services from 'services';
import { ListStoreConstructor } from './core/ListStoreConstructor';
import { computed, observable } from 'mobx';
import * as _ from 'lodash';
import { getIdentityTokensInfo } from 'services';

export class IdentityTokens extends ListStoreConstructor<IIdentityTokenInfo> {
  @observable fullTokensList = [];

  constructor(stores: IStores) {
    super(
      stores,
      () =>
        services.getIdentityTokensInfo({ page: 0, size: 10 }).then(data => {
          this.fullTokensList = data.content;

          // filter by blackList
          let content = data.content.map(function(t) {
            t.key = t.contractAddress
            return t;
          });

          // UNIQ
          content = _.uniqWith(
            content,
            (a: any, b: any) =>
              a.contractAddress === b.contractAddress &&
              a.mappingAddress === b.mappingAddress,
          );

          return {
            ...data,
            content,
          };
        }),
      {
        pollingInterval: 30000,
        isLocal: true,
        paginationData: { pageSize: 10 },
        sorter: 'name, asc',
        sorters: {
          name: 'asc',
        },
      },
    );
  }
}

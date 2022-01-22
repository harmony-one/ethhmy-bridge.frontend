import { ITokenInfo, NETWORK_TYPE } from './interfaces';
import { IStores } from './index';
import * as services from 'services';
import { ListStoreConstructor } from './core/ListStoreConstructor';
import { computed, observable } from 'mobx';
import * as _ from 'lodash';

export class Tokens extends ListStoreConstructor<ITokenInfo> {
  @observable fullTokensList = [];

  constructor(stores: IStores) {
    super(
      stores,
      () =>
        services.getTokensInfo({ page: 0, size: 1000 }).then(data => {
          this.fullTokensList = data.content;

          // filter by blackList
          let content = data.content.filter(
            t =>
              !stores.uiConfig.assetsBlackList.includes(
                t.hrc20Address.toLowerCase(),
              ) &&
              !stores.uiConfig.assetsBlackList.includes(
                t.erc20Address.toLowerCase(),
              ),
          );

          const hasAddress = (token: ITokenInfo) => {
            return content.find(
              t =>
                token.type !== t.type &&
                (token.hrc20Address === t.hrc20Address ||
                  token.erc20Address === t.erc20Address),
            );
          };

          content = content.filter(t => {
            if (
              t.symbol === '1ONE' &&
              String(t.hrc20Address).toLowerCase() !==
                String(process.env.ONE_HRC20).toLowerCase()
            ) {
              return false;
            }

            if (
              t.symbol === 'ONE' &&
              hasAddress(t) &&
              String(t.hrc20Address).toLowerCase() !==
                String(process.env.ONE_HRC20).toLowerCase()
            ) {
              return false;
            }

            return true;
          });

          // content = content.filter(
          //   t => t.network === NETWORK_TYPE.BINANCE && hasAddress(t),
          // );

          content = content.filter(t => t.type !== 'hrc20' || !hasAddress(t));

          // UNIQ
          content = _.uniqWith(
            content,
            (a: any, b: any) =>
              a.erc20Address === b.erc20Address &&
              a.hrc20Address === b.hrc20Address,
          );

          content = content.map(c => ({
            ...c,
            network: c.network || NETWORK_TYPE.ETHEREUM,
          }));

          content.sort((a, b) =>
            a.totalLockedUSD > b.totalLockedUSD ? -1 : 1,
          );

          return {
            ...data,
            content,
          };
        }),
      {
        pollingInterval: 30000,
        isLocal: true,
        paginationData: { pageSize: 100 },
        sorter: 'totalLockedUSD, asc',
        sorters: {
          totalLockedUSD: 'asc',
        },
      },
    );
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

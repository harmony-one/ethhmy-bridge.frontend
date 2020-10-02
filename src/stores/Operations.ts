import { StoreConstructor } from './core/StoreConstructor';
import { action, observable } from 'mobx';
import { statusFetching } from '../constants';
import { IOperation } from './interfaces';
import { IStores } from './index';
import * as services from 'services';

export class Operations extends StoreConstructor {
  @observable status: statusFetching = 'init';
  @observable list: IOperation[] = [];
  @observable error = '';

  constructor(stores: IStores) {
    super(stores);

    setInterval(() => {
      this.getList();
    }, 10000);
  }

  @action.bound
  getList() {
    if (this.status === 'init') {
      this.status = 'first_fetching';
    } else {
      this.status = 'fetching';
    }

    return services
      .getOperations()
      .then(operations => {
        this.list = operations.filter(o => !!o.timestamp);
        this.status = 'success';
      })
      .catch(e => {
        console.error(e);
        this.status = 'error';
        this.error = e.message;
      });
  }

  @action.bound
  clear() {
    this.status = 'init';
    this.list = [];
  }
}

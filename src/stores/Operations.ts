import { IOperation } from './interfaces';
import { IStores } from './index';
import * as services from 'services';
import { ListStoreConstructor } from './core/ListStoreConstructor';
import { observable } from 'mobx';
import { validators } from 'services';

export class Operations extends ListStoreConstructor<IOperation> {
  @observable validatorUrl = validators[0];
  @observable manager = '';

  constructor(stores: IStores) {
    super(stores, params => services.getOperations(params, this.validatorUrl), {
      pollingInterval: 10000,
    });
  }
}

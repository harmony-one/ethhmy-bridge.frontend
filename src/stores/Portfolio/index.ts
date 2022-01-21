import { ITokenInfo } from '../interfaces';
import { StoreConstructor } from '../core/StoreConstructor';
import * as services from 'services';
import { action, observable } from 'mobx';
import { validators } from 'services';
import { getTokensFromOperations } from './helpers';

export class Portfolio extends StoreConstructor {
  @observable tokens: ITokenInfo[] = [];

  @action.bound
  async loadOperationList(ethAddress: string, oneAddress: string) {
    const params = {
      ethAddress,
      oneAddress
    };

    const operations = await services.getOperations(params, validators[0]);

    try {
      this.tokens = getTokensFromOperations(
        operations.content,
        this.stores.tokens,
      );
    } catch (ex) {
      console.log('### ex', ex);
    }
  }
}

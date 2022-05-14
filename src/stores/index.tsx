import RouterStore from 'stores/RouterStore';
import { ActionModalsStore } from './ActionModalsStore';
import { UserStoreEx } from './UserStore';
import { UserStoreMetamask } from './UserStoreMetamask';
import { Exchange } from './Exchange';
import { Operations } from './Operations';
import { AdminOperations } from './AdminOperations';
import { Tokens } from './Tokens';
import { IdentityTokens } from './IdentityTokens';
import { createStoresContext } from './create-context';
import { Erc20SelectStore } from './Erc20SelectStore';
import { AdminOperationsFull } from './AdminOperationsFull';
import { UIConfig } from './UIConfig';

export interface IStores {
  routing?: RouterStore;
  actionModals?: ActionModalsStore;
  user?: UserStoreEx;
  userMetamask?: UserStoreMetamask;
  exchange?: Exchange;
  operations?: Operations;
  adminOperations?: AdminOperations;
  adminOperationsFull?: AdminOperationsFull;
  tokens?: Tokens;
  itokens?: IdentityTokens;
  uiConfig?: UIConfig;
  erc20Select?: Erc20SelectStore;
}

const stores: IStores = {};

stores.routing = new RouterStore();
stores.exchange = new Exchange(stores);
stores.operations = new Operations(stores);
stores.adminOperations = new AdminOperations(stores);
stores.adminOperationsFull = new AdminOperationsFull(stores);
stores.tokens = new Tokens(stores);
stores.itokens = new IdentityTokens(stores);
stores.actionModals = new ActionModalsStore();
stores.user = new UserStoreEx(stores);
stores.userMetamask = new UserStoreMetamask(stores);
stores.erc20Select = new Erc20SelectStore(stores);
stores.uiConfig = new UIConfig(stores);

if (!process.env.production) {
  window.stores = stores;
}

const { StoresProvider, useStores } = createStoresContext<typeof stores>();
export { StoresProvider, useStores };

export default stores;

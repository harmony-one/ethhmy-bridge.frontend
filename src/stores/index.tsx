import RouterStore from 'stores/RouterStore';
import { ActionModalsStore } from './ActionModalsStore';
import { UserStoreEx } from './UserStore';
import { UserStoreMetamask } from './UserStoreMetamask';
import { Exchange } from './Exchange';
import { Operations } from './Operations';
import { createStoresContext } from './create-context';

export interface IStores {
  routing?: RouterStore;
  actionModals?: ActionModalsStore;
  user?: UserStoreEx;
  userMetamask?: UserStoreMetamask;
  exchange?: Exchange;
  operations?: Operations;
}

const stores: IStores = {};

stores.routing = new RouterStore();
stores.exchange = new Exchange(stores);
stores.operations = new Operations(stores);
stores.actionModals = new ActionModalsStore();
stores.user = new UserStoreEx(stores);
stores.userMetamask = new UserStoreMetamask(stores);

if (!process.env.production) {
  window.stores = stores;
}

const { StoresProvider, useStores } = createStoresContext<typeof stores>();
export { StoresProvider, useStores };

export default stores;

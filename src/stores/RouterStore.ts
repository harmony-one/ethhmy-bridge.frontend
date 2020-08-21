import { createBrowserHistory } from 'history';
import { RouterStore, syncHistoryWithStore } from 'mobx-react-router';

export default class CustomRouterStore extends RouterStore {
  constructor() {
    super();
    const browserHistory = createBrowserHistory();

    this.history = syncHistoryWithStore(browserHistory, this);
  }
}

import { createBrowserHistory } from 'history';
import { generatePath } from 'react-router';
import qs from 'qs';
import { RouterStore, syncHistoryWithStore } from 'mobx-react-router';

export default class CustomRouterStore extends RouterStore {
  constructor() {
    super();
    const browserHistory = createBrowserHistory();

    this.history = syncHistoryWithStore(browserHistory, this);
  }

  generatePath(
    route: string,
    params: Record<string, string | number> = {},
    queryParams: Record<string, unknown> = {},
  ) {
    const path = generatePath(route, params);
    const query = qs.stringify(queryParams);
    if (query) {
      return `${path}?${query}`;
    }

    return path;
  }

  goTo(
    path: string,
    params: Record<string, string | number> = {},
    queryParams: Record<string, unknown> = {},
  ) {
    const url = this.generatePath(path, params, queryParams);
    this.push(url);
  }

  goToModal(modalId: string, params: unknown) {
    const query = qs.stringify(params);
    this.push(`${this.location.pathname}?${query}`);
  }

  closeModal(replace: boolean = true) {
    if (replace) {
      this.replace(this.location.pathname);
      return;
    }

    const { modal, ...rest } = qs.parse(this.location.search);
    const queryString = qs.stringify(rest);

    const location = `${this.location.pathname}?${queryString}`;
    if (replace) {
      this.replace(location);
    }
    this.push(location);
  }
}

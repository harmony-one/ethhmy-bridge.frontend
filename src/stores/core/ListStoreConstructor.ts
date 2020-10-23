import { StoreConstructor } from './StoreConstructor';
import { computed, observable, reaction } from 'mobx';
import * as _ from 'lodash';
import { isArray } from 'lodash';
import { statusFetching } from '../../constants';

export interface NormalizedError {
  code?: number | string;
  status?: number;
  message: string;
}

interface ServerResponse<T> {
  content: T[];
  size: number;
  totalPages: number;
  totalElements: number;
}

export interface ListData<T> {
  list: T[];
  size: number;
  totalPages: number;
  totalElements: number;
}

interface IListStoreOptions {
  pollingInterval?: number;
  paginationData?: IPagination;
  sorter?: string | string[];
  sorters?: ISorters;
  filters?: IFilters;
  isLocal?: boolean;
}

type TSorter = 'none' | 'asc' | 'desc';

interface ISorters {
  [name: string]: TSorter;
}

interface IFilters {
  [name: string]: any;
}

interface IPagination {
  currentPage?: number;
  totalPages?: number;
  totalElements?: number;
  pageSize?: number;
}

interface IDataFlowProps {
  paginationData?: IPagination;
  sorter?: string | string[];
  sorters?: ISorters;
  filters?: IFilters;
}

//type EndpointFn = <T>(params: any) => Promise<{ content: T[] }>;

export class ListStoreConstructor<T> extends StoreConstructor {
  @observable public allData: T[] = [];
  @observable public lastUpdateTime;
  @observable public fetchStatus: statusFetching = 'init';
  @observable public paginationData: IPagination = {};
  @observable public sorters: ISorters = {};
  @observable public sorter: string | string[];
  @observable public filters: IFilters = {};
  @observable public fetchError: NormalizedError;
  public endpointFn: (
    params: any,
  ) => Promise<{ content: T[]; [name: string]: any }>;
  public debouncedFetch: any;
  public pollingInterval: number;
  tId: number;

  reactionId: any;

  @observable isLocal = false;

  @computed
  public get isPending() {
    return this.fetchStatus === 'fetching';
  }

  constructor(
    stores: any,
    endpoint: (params: any) => Promise<{ content: T[] }>,
    options: IListStoreOptions,
  ) {
    super(stores);
    this.endpointFn = endpoint;

    const { pollingInterval = 0 } = options;
    this.pollingInterval = pollingInterval;

    this.sorters = options.sorters || {};
    this.sorter = options.sorter || 'none';
    this.filters = options.filters || {};

    this.isLocal = options.isLocal;

    this.paginationData = {
      currentPage: 1,
      totalPages: 1,
      pageSize: 10,
      ...(options ? options.paginationData : {}),
    };

    if (this.isLocal) {
      if (this.reactionId) this.reactionId();

      this.reactionId = reaction(
        () => this.filteredData,
        () => {
          this.paginationData.totalPages = Math.ceil(
            this.filteredData.length / this.paginationData.pageSize,
          );
        },
      );
    }
  }

  init(options?: IListStoreOptions) {
    clearInterval(this.tId);
    this.tId = null;

    if (!_.isEmpty(options)) {
      this.onChangeDataFlow(options);
    } else {
      // this.fetch(); //Commented to prevent double fetch TableC component in componentWillMount method
    }

    if (this.pollingInterval > 0) {
      this.tId = setInterval(() => {
        !this.isPending && this.fetch({}, true);
      }, this.pollingInterval);
    }
  }

  public get dataFlow() {
    return {
      paginationData: this.paginationData,
      sorters: this.sorters,
      sorter: this.sorter,
      filters: this.filters,
    };
  }

  onChangeDataFlow = (props: IDataFlowProps, withDebounce?: boolean) => {
    const { paginationData = {}, sorter, sorters = {}, filters = {} } = props;
    if (paginationData.pageSize !== this.paginationData.pageSize) {
      this.paginationData = {
        ...this.paginationData,
        ...paginationData,
        currentPage: 1,
        totalPages: Math.ceil(
          paginationData.totalElements / paginationData.pageSize,
        ),
      };
    } else {
      this.paginationData = { ...this.paginationData, ...paginationData };
    }
    this.sorter = isArray(sorter)
      ? sorter
      : sorter === 'none'
      ? undefined
      : sorter || this.sorter;
    this.sorters = { ...this.sorters, ...sorters };
    this.filters = { ...this.filters, ...filters };

    if (!_.isEmpty(filters)) {
      this.paginationData.currentPage = 1;
    }

    if (!withDebounce) {
      if (!this.isLocal) {
        return this.fetch();
      }
    }

    if (withDebounce && this.debouncedFetch) {
      return this.debouncedFetch();
    }

    if (withDebounce && !this.debouncedFetch) {
      this.fetch();
      this.debouncedFetch = _.debounce(this.fetch, 300);
    }
  };

  removeFilters() {
    this.filters = {};
    if (!this.isLocal) {
      this.fetch();
    }
  }

  updatePagination(res: ServerResponse<T>) {
    const { totalPages, size, totalElements } = res;

    this.paginationData = {
      ...this.paginationData,
      totalPages,
      totalElements,
      pageSize: size,
    };
  }

  @computed
  get queryParams() {
    const { currentPage, pageSize } = this.paginationData;
    return {
      size: pageSize,
      page: currentPage - 1,
      ...this.filters,
      sort: isArray(this.sorter)
        ? this.sorter
        : this.sorter !== 'none'
        ? this.sorter
        : undefined,
    };
  }

  @computed
  get filteredData() {
    if (!this.isLocal) return this.allData;

    return this.allData.filter(rowData =>
      Object.entries(this.filters)
        .filter(([key, value]) => !!value)
        .every(([key, value]) => {
          return value instanceof Array
            ? value.includes(rowData[key])
            : rowData[key].indexOf(value) > -1;
        }),
    );
  }

  @computed
  get sortedData() {
    if (!this.isLocal) return this.filteredData;

    console.log(this.sorter);

    if (!this.sorter || this.sorter === 'none') {
      return this.filteredData;
    }

    const sorter = Array.isArray(this.sorter) ? this.sorter[0] : this.sorter;

    const [index, direction] = sorter.split(',');
    const dir = direction === 'asc' ? 1 : -1;
    return this.filteredData.sort((a, b) => {
      return Number(a[index]) < Number(b[index]) ? dir : -dir;
    });
  }

  @computed
  get data() {
    if (this.isLocal) {
      const { pageSize, currentPage } = this.paginationData;

      return this.sortedData.splice(pageSize * (currentPage - 1), pageSize);
    } else {
      return this.allData;
    }
  }

  fetch = (params?: any, isSilent?: boolean) => {
    if (!isSilent) {
      this.fetchStatus = 'fetching';
    }

    return this.endpointFn(this.isLocal ? null : this.queryParams)
      .then((res: any) => {
        this.fetchStatus = 'success';

        if (this.isLocal) {
          this.allData = res.content;
          this.lastUpdateTime = res.lastUpdateTime;
        } else {
          this.allData = res.content;
          this.lastUpdateTime = res.lastUpdateTime;
          this.updatePagination(res);
        }

        return res;
      })
      .catch((error: NormalizedError) => {
        this.fetchStatus = 'error';
        this.fetchError = error;
      });
  };

  clear() {
    this.allData = [];
    clearInterval(this.tId);
    this.tId = null;
    this.fetchStatus = 'init';
  }
}

import {NETWORK_TYPE} from '../stores/interfaces';



interface RocketInventory {
  id: number;
  model: string;
  year: number;
  stock: number;
}

interface Assets {
  assets: Asset[];
}

interface Asset {
  address: string;
  burnsCount: string;
  eventsCount: string;
  id: string;
  mappedAddress: string;
  mintsCount: string;
  network: string;
  symbol: string;
  totalLocked: string;
}

type SubgraphComponentProp =  {
    query: string,
    // this is the field that is needed when we want to aggregate the json based on a value
    aggregateField?: string,
    title?: string, 
    // this value will be used to decide to show assets or users or ...
    dataType?: string,
    chartType?: ChartType,
    // this is a flag to indicate whether to show the date flag or not 
    showDateFilter?: boolean,
    // this is for setting the right client for Apollo useQuery 
    network?: NETWORK_TYPE
}

enum ChartType {
  TRANSACTION = 1,
  WALLET_DAILY = 2,
}


type SubgraphTableComponentProp =  {
    query: string,
}

export {Asset, Assets, RocketInventory,
  SubgraphComponentProp, SubgraphTableComponentProp, ChartType}


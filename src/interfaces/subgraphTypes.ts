



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

type SubgraphNumericComponentProp =  {
    query: string,
    // this is the field that is needed when we want to aggregate the json based on a value
    aggregateField?: string,
    title?: string, 
    // this value will be used to decide to show assets or users or ...
    dataType?: string
}

type SubgraphTableComponentProp =  {
    query: string,
}

export {Asset, Assets, RocketInventory, SubgraphNumericComponentProp, SubgraphTableComponentProp}


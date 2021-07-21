
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
    aggregateField?: string 
}

export {Asset, Assets, RocketInventory, SubgraphNumericComponentProp}


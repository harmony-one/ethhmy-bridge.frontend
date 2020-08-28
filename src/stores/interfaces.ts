export enum OPERATION_TYPE {
  'BUSD_ETH_ONE' = 'busd_eth_one',
  'BUSD_ONE_ETH' = 'busd_one_eth',
  'LINK_ETH_ONE' = 'link_eth_one',
  'LINK_ONE_ETH' = 'link_one_eth',
}

export enum ACTION_TYPE {
  // ETH_TO_ONE
  'approveEthManger' = 'approveEthManger',
  'lockToken' = 'lockToken',
  'waitingBlockNumber' = 'waitingBlockNumber',
  'mintToken' = 'mintToken',

  // ONE_TO_ETH
  'approveHmyManger' = 'approveHmyManger',
  'burnToken' = 'burnToken',
  'unlockToken' = 'unlockToken',
}

export enum TOKEN {
  BUSD = 'busd',
  LINK = 'link',
}

export enum STATUS {
  ERROR = 'error',
  SUCCESS = 'success',
  WAITING = 'waiting',
  IN_PROGRESS = 'in_progress',
}

export interface IAction {
  id: string;
  type: ACTION_TYPE;
  status: STATUS;
  transactionHash: string;
  error: string;
  message: string;
  timestamp: number;
}

export interface IOperation {
  id: string;
  type: OPERATION_TYPE;
  status: STATUS;
  amount: number;
  ethAddress: string;
  oneAddress: string;
  actions: Array<IAction>;
}

export enum EXCHANGE_MODE {
  ETH_TO_ONE = 'eth_to_one',
  ONE_TO_ETH = 'one_to_eth',
}

export enum TOKEN {
  BUSD = 'busd',
  LINK = 'link',
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
  type: EXCHANGE_MODE;
  token: TOKEN;
  status: STATUS;
  amount: number;
  ethAddress: string;
  oneAddress: string;
  actions: Array<IAction>;
}

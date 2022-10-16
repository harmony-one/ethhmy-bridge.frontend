export enum NETWORK_TYPE {
  ETHEREUM = 'ETHEREUM',
  BINANCE = 'BINANCE',
  HARMONY = 'HARMONY',
}

export enum EXCHANGE_MODE {
  ETH_TO_ONE = 'eth_to_one',
  ONE_TO_ETH = 'one_to_eth',
}

export enum TOKEN {
  ALL = 'all',
  BUSD = 'busd',
  LINK = 'link',
  ERC20 = 'erc20',
  HRC20 = 'hrc20',
  ETH = 'eth',
  ONE = 'one',
  ERC721 = 'erc721',
  HRC721 = 'hrc721',
  ERC1155 = 'erc1155',
  HRC1155 = 'hrc1155',
}

export type TConfig = {
  nodeURL: string;
  explorerURL: string;
  tokens: TOKEN[];
  contracts: {
    busd: string;
    link: string;
    busdManager: string;
    linkManager: string;
    erc20Manager: string;
    erc721Manager: string;
    multisigWallet: string;
    tokenManager: string;
    hrc20Manager: string;
    hrc721Manager: string;
    hrc721TokenManager: string;
    hrc1155Manager: string;
    hrc1155TokenManager: string;
    erc1155Manager: string;
    ethManager: string;
    nativeTokenHRC20: string;
  };
  gasPrice?: number;
  gasLimit?: number;
};

export type TFullConfig = {
  ethClient: TConfig;
  binanceClient: TConfig;
  hmyClient: TConfig;
};

export enum ACTION_TYPE {
  // ALL
  'depositOne' = 'depositOne',
  'withdrawOne' = 'withdrawOne',

  // ETH_TO_ONE
  'getHRC20Address' = 'getHRC20Address',
  'approveEthManger' = 'approveEthManger',
  'lockToken' = 'lockToken',
  'waitingBlockNumber' = 'waitingBlockNumber',
  'mintToken' = 'mintToken',
  'mintTokenRollback' = 'mintTokenRollback',

  // ONE_TO_ETH
  'approveHmyManger' = 'approveHmyManger',
  'burnToken' = 'burnToken',
  'waitingBlockNumberHarmony' = 'waitingBlockNumberHarmony',
  'unlockToken' = 'unlockToken',
  'unlockTokenRollback' = 'unlockTokenRollback',
  'topUpAccount' = 'topUpAccount',

  // HRC20
  'approveHRC20HmyManger' = 'approveHRC20HmyManger',
  'approveHRC20EthManger' = 'approveHRC20EthManger',
  'getERC20Address' = 'getERC20Address',
  'lockHRC20Token' = 'lockHRC20Token',
  'unlockHRC20Token' = 'unlockHRC20Token',
  'burnHRC20Token' = 'burnHRC20Token',
  'mintHRC20Token' = 'mintHRC20Token',
  'unlockHRC20TokenRollback' = 'unlockHRC20TokenRollback',
  'mintHRC20TokenRollback' = 'mintHRC20TokenRollback',

  // HRC721
  'getHRC721Address' = 'getHRC721Address',
  'approveHRC721HmyManger' = 'approveHRC721HmyManger',
  'approveHRC721EthManger' = 'approveHRC721EthManger',
  'lockHRC721Token' = 'lockHRC721Token',
  'unlockHRC721Token' = 'unlockHRC721Token',
  'burnHRC721Token' = 'burnHRC721Token',
  'mintHRC721Token' = 'mintHRC721Token',
  'unlockHRC721TokenRollback' = 'unlockHRC721TokenRollback',
  'mintHRC721TokenRollback' = 'mintHRC721TokenRollback',

  // HRC1155
  'getHRC1155Address' = 'getHRC1155Address',
  'approveHRC1155HmyManger' = 'approveHRC1155HmyManger',
  'approveHRC1155EthManger' = 'approveHRC1155EthManger',
  'lockHRC1155Token' = 'lockHRC1155Token',
  'unlockHRC1155Token' = 'unlockHRC1155Token',
  'burnHRC1155Token' = 'burnHRC1155Token',
  'mintHRC1155Token' = 'mintHRC1155Token',
  'unlockHRC1155TokenRollback' = 'unlockHRC1155TokenRollback',
  'mintHRC1155TokenRollback' = 'mintHRC1155TokenRollback',

  // ERC1155
  'getERC1155Address' = 'getERC1155Address',
  'approveERC1155HmyManger' = 'approveERC1155HmyManger',
  'approveERC1155EthManger' = 'approveERC1155EthManger',
  'lockERC1155Token' = 'lockERC1155Token',
  'unlockERC1155Token' = 'unlockERC1155Token',
  'burnERC1155Token' = 'burnERC1155Token',
  'mintERC1155Token' = 'mintERC1155Token',
  'unlockERC1155TokenRollback' = 'unlockERC1155TokenRollback',
  'mintERC1155TokenRollback' = 'mintERC1155TokenRollback',
}

export enum STATUS {
  ERROR = 'error',
  SUCCESS = 'success',
  WAITING = 'waiting',
  IN_PROGRESS = 'in_progress',
  CANCELED = 'canceled',
}

export interface IAction {
  id: string;
  type: ACTION_TYPE;
  status: STATUS;
  transactionHash: string;
  error: string;
  message: string;
  timestamp: number;
  depositAmount?: number;
  payload: any;
}

export interface IOperation {
  id: string;
  type: EXCHANGE_MODE;
  token: TOKEN;
  status: STATUS;
  amount: number;
  fee: number;
  ethAddress: string;
  oneAddress: string;
  actions: Array<IAction>;
  timestamp: number;
  erc20Address?: string;
  hrc20Address?: string;
  hrc721Address?: string;
  hrc1155Address?: string;
  hrc1155TokenId?: string;
  erc1155Address?: string;
  erc1155TokenId?: string;
  network: NETWORK_TYPE;
}

export interface ITokenInfo {
  name: string;
  symbol: string;
  decimals: string;
  erc20Address: string;
  hrc20Address: string;
  totalLocked: string;
  totalSupply: string;
  totalLockedNormal: string;
  totalLockedUSD: string;
  token: TOKEN;
  type: TOKEN;
  network: NETWORK_TYPE;
  proxyERC20?: string;
  proxyHRC20?: string;
  image?: string;
  config?: {
    endpoint: string,
    chainId: number,
  }
}

export interface IIdentityTokenInfo {
  avatar: string;
  key: string;
  name: string;
  contractAddress: string;
  mappingAddress: string;
  openSea: string;
  website: string;
  twitter: string;
}

export interface OpenSeaValideResponse {
  collection: {
    safelist_request_status: string;
    slug: string;
  };
  address: string;
}

export interface OpenSeaSingleAssetResponse {
  name: string;
  image_preview_url: string;
  collection: {
    name: string;
  };
}

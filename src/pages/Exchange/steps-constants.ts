import { ACTION_TYPE, NETWORK_TYPE, TOKEN } from 'stores/interfaces';

export const getStepsTitle = (
  action: ACTION_TYPE,
  token: TOKEN,
  network: NETWORK_TYPE,
) => {
  if ((token === TOKEN.ERC721 || token === TOKEN.HRC721) && action === ACTION_TYPE.getHRC20Address) {
    return 'Register user ERC721 on Harmony';
  }

  switch (network) {
    case NETWORK_TYPE.ETHEREUM:
      return STEPS_TITLE_ETHEREUM[action];
    case NETWORK_TYPE.BINANCE:
      return STEPS_TITLE_BINANCE[action];
    case NETWORK_TYPE.HARMONYSHARD1:
      return STEPS_TITLE_HARMONYSHARD1[action];
    default:
      return STEPS_TITLE_ETHEREUM[action];
  }
};

const STEPS_TITLE_BINANCE: Record<ACTION_TYPE, string> = {
  depositOne: 'Deposit ONE tokens',
  withdrawOne: 'Withdraw ONE tokens',

  getHRC20Address: 'Register user BEP20 on Harmony',
  approveEthManger: 'User approve bridge to lock tokens ',
  lockToken: 'Bridge lock tokens on Binance Smart Chain',
  waitingBlockNumber: 'Wait for 15 block confirmations',
  mintToken: 'Bridge mint tokens on Harmony',
  mintTokenRollback: 'Unlock failed, minting back the burned tokens on Harmony',
  topUpAccount: 'Top up user account to 0.001 ONE',

  // ONE TO ETH
  approveHmyManger: 'User approve bridge to burn tokens',
  burnToken: 'Bridge burn tokens on Harmony',
  waitingBlockNumberHarmony: 'Wait for 13 block confirmations',
  unlockToken: 'Bridge unlocks tokens on Binance Smart Chain',
  unlockTokenRollback: 'Mint failed, unlocking tokens on Binance Smart Chain',

  // HRC20
  approveHRC20HmyManger: 'User approve bridge to lock tokens',
  approveHRC20EthManger: 'User approve bridge to burn tokens',
  getERC20Address: 'Register user HRC20 on Binance Smart Chain',
  lockHRC20Token: 'Bridge lock tokens on Harmony',
  unlockHRC20Token: 'Bridge unlocks tokens on Harmony',
  burnHRC20Token: 'Bridge burn tokens on Binance Smart Chain',
  mintHRC20Token: 'Bridge mint tokens on Binance Smart Chain',
  unlockHRC20TokenRollback: 'Mint failed, unlocking tokens on Harmony',
  mintHRC20TokenRollback:
    'Unlock failed, minting back the burned tokens on Binance Smart Chain',

  // HRC721
  getHRC721Address: 'Register user HRC721 on Binance Smart Chain',
  approveHRC721HmyManger: 'User approve bridge to lock tokens',
  approveHRC721EthManger: 'User approve bridge to burn tokens',
  lockHRC721Token: 'Bridge lock tokens on Harmony',
  unlockHRC721Token: 'Bridge unlocks tokens on Harmony',
  burnHRC721Token: 'Bridge burn tokens on Binance Smart Chain',
  mintHRC721Token: 'Bridge mint tokens on Binance Smart Chain',
  unlockHRC721TokenRollback: 'Mint failed, unlocking tokens on Harmony',
  mintHRC721TokenRollback: 'Unlock failed, minting back the burned tokens on Binance Smart Chain',

  // HRC1155
  getHRC1155Address: 'Register user HRC1155 on Binance Smart Chain',
  approveHRC1155HmyManger: 'User approve bridge to lock tokens',
  approveHRC1155EthManger: 'User approve bridge to burn tokens',
  lockHRC1155Token: 'Bridge lock tokens on Harmony',
  unlockHRC1155Token: 'Bridge unlocks tokens on Harmony',
  burnHRC1155Token: 'Bridge burn tokens on Binance Smart Chain',
  mintHRC1155Token: 'Bridge mint tokens on Binance Smart Chain',
  unlockHRC1155TokenRollback: 'Mint failed, unlocking tokens on Harmony',
  mintHRC1155TokenRollback: 'Unlock failed, minting back the burned tokens on Binance Smart Chain',

  // ERC721
  getERC721Address: 'Register user ERC721 on Binance Smart Chain',
  approveERC721HmyManger: 'User approve bridge to lock tokens',
  approveERC721EthManger: 'User approve bridge to burn tokens',
  lockERC721Token: 'Bridge lock tokens on Harmony',
  unlockERC721Token: 'Bridge unlocks tokens on Harmony',
  burnERC721Token: 'Bridge burn tokens on Binance Smart Chain',
  mintERC721Token: 'Bridge mint tokens on Binance Smart Chain',
  unlockERC721TokenRollback: 'Mint failed, unlocking tokens on Harmony',
  mintERC721TokenRollback: 'Unlock failed, minting back the burned tokens on Binance Smart Chain',

  // ERC1155
  getERC1155Address: 'Register user ERC1155 on Binance Smart Chain',
  approveERC1155HmyManger: 'User approve bridge to lock tokens',
  approveERC1155EthManger: 'User approve bridge to burn tokens',
  lockERC1155Token: 'Bridge lock tokens on Harmony',
  unlockERC1155Token: 'Bridge unlocks tokens on Harmony',
  burnERC1155Token: 'Bridge burn tokens on Binance Smart Chain',
  mintERC1155Token: 'Bridge mint tokens on Binance Smart Chain',
  unlockERC1155TokenRollback: 'Mint failed, unlocking tokens on Harmony',
  mintERC1155TokenRollback: 'Unlock failed, minting back the burned tokens on Binance Smart Chain',
};


const STEPS_TITLE_HARMONYSHARD1: Record<ACTION_TYPE, string> = {
  depositOne: 'Deposit ONE tokens',
  withdrawOne: 'Withdraw ONE tokens',

  getHRC20Address: 'Register user GHRC20 on Harmony',
  approveEthManger: 'User approve bridge to lock tokens ',
  lockToken: 'Bridge lock tokens on Game Shard',
  waitingBlockNumber: 'Wait for 15 block confirmations',
  mintToken: 'Bridge mint tokens on Harmony',
  mintTokenRollback: 'Unlock failed, minting back the burned tokens on Harmony',
  topUpAccount: 'Top up user account to 0.001 ONE',

  // ONE TO ETH
  approveHmyManger: 'User approve bridge to burn tokens',
  burnToken: 'Bridge burn tokens on Harmony',
  waitingBlockNumberHarmony: 'Wait for 13 block confirmations',
  unlockToken: 'Bridge unlocks tokens on Game Shard',
  unlockTokenRollback: 'Mint failed, unlocking tokens on Game Shard',

  // HRC20
  approveHRC20HmyManger: 'User approve bridge to lock tokens',
  approveHRC20EthManger: 'User approve bridge to burn tokens',
  getERC20Address: 'Register user HRC20 on Game Shard',
  lockHRC20Token: 'Bridge lock tokens on Harmony',
  unlockHRC20Token: 'Bridge unlocks tokens on Harmony',
  burnHRC20Token: 'Bridge burn tokens on Game Shard',
  mintHRC20Token: 'Bridge mint tokens on Game Shard',
  unlockHRC20TokenRollback: 'Mint failed, unlocking tokens on Harmony',
  mintHRC20TokenRollback:
    'Unlock failed, minting back the burned tokens on Game Shard',

  // HRC721
  getHRC721Address: 'Register user HRC721 on Game Shard',
  approveHRC721HmyManger: 'User approve bridge to lock tokens',
  approveHRC721EthManger: 'User approve bridge to burn tokens',
  lockHRC721Token: 'Bridge lock tokens on Harmony',
  unlockHRC721Token: 'Bridge unlocks tokens on Harmony',
  burnHRC721Token: 'Bridge burn tokens on Game Shard',
  mintHRC721Token: 'Bridge mint tokens on Game Shard',
  unlockHRC721TokenRollback: 'Mint failed, unlocking tokens on Harmony',
  mintHRC721TokenRollback: 'Unlock failed, minting back the burned tokens on Game Shard',

  // HRC1155
  getHRC1155Address: 'Register user HRC1155 on Game Shard',
  approveHRC1155HmyManger: 'User approve bridge to lock tokens',
  approveHRC1155EthManger: 'User approve bridge to burn tokens',
  lockHRC1155Token: 'Bridge lock tokens on Harmony',
  unlockHRC1155Token: 'Bridge unlocks tokens on Harmony',
  burnHRC1155Token: 'Bridge burn tokens on Game Shard',
  mintHRC1155Token: 'Bridge mint tokens on Game Shard',
  unlockHRC1155TokenRollback: 'Mint failed, unlocking tokens on Harmony',
  mintHRC1155TokenRollback: 'Unlock failed, minting back the burned tokens on Game Shard',

  // ERC721
  getERC721Address: 'Register user GHRC721 on Game Shard',
  approveERC721HmyManger: 'User approve bridge to lock tokens',
  approveERC721EthManger: 'User approve bridge to burn tokens',
  lockERC721Token: 'Bridge lock tokens on Harmony',
  unlockERC721Token: 'Bridge unlocks tokens on Game Shard',
  burnERC721Token: 'Bridge burn tokens on Harmony',
  mintERC721Token: 'Bridge mint tokens on Game Shard',
  unlockERC721TokenRollback: 'Mint failed, unlocking tokens on Harmony',
  mintERC721TokenRollback: 'Unlock failed, minting back the burned tokens on Game Shard',

  // ERC1155
  getERC1155Address: 'Register user GHRC1155 on Game Shard',
  approveERC1155HmyManger: 'User approve bridge to lock tokens',
  approveERC1155EthManger: 'User approve bridge to burn tokens',
  lockERC1155Token: 'Bridge lock tokens on Harmony',
  unlockERC1155Token: 'Bridge unlocks tokens on Game Shard',
  burnERC1155Token: 'Bridge burn tokens on Harmony',
  mintERC1155Token: 'Bridge mint tokens on Game Shard',
  unlockERC1155TokenRollback: 'Mint failed, unlocking tokens on Harmony',
  mintERC1155TokenRollback: 'Unlock failed, minting back the burned tokens on Game Shard',
};

const STEPS_TITLE_ETHEREUM: Record<ACTION_TYPE, string> = {
  depositOne: 'Deposit ONE tokens',
  withdrawOne: 'Withdraw ONE tokens',

  getHRC20Address: 'Register user ERC20 on Harmony',
  approveEthManger: 'User approve bridge to lock tokens ',
  lockToken: 'Bridge lock tokens on Ethereum',
  waitingBlockNumber: 'Wait for 13 block confirmations',
  mintToken: 'Bridge mint tokens on Harmony',
  mintTokenRollback: 'Unlock failed, minting back the burned tokens on Harmony',

  // ONE TO ETH
  approveHmyManger: 'User approve bridge to burn tokens',
  burnToken: 'Bridge burn tokens on Harmony',
  waitingBlockNumberHarmony: 'Wait for 13 block confirmations',
  unlockToken: 'Bridge unlocks tokens on Ethereum',
  unlockTokenRollback: 'Mint failed, unlocking tokens on Ethereum',

  topUpAccount: 'Top up user account to 0.001 ONE',

  // HRC20
  approveHRC20HmyManger: 'User approve bridge to lock tokens',
  approveHRC20EthManger: 'User approve bridge to burn tokens',
  getERC20Address: 'Register user HRC20 on Ethereum',
  lockHRC20Token: 'Bridge lock tokens on Harmony',
  unlockHRC20Token: 'Bridge unlocks tokens on Harmony',
  burnHRC20Token: 'Bridge burn tokens on Ethereum',
  mintHRC20Token: 'Bridge mint tokens on Ethereum',
  unlockHRC20TokenRollback: 'Mint failed, unlocking tokens on Harmony',
  mintHRC20TokenRollback:
    'Unlock failed, minting back the burned tokens on Ethereum',

  // HRC721
  getHRC721Address: 'Register user HRC721 on Ethereum',
  approveHRC721HmyManger: 'User approve bridge to lock tokens',
  approveHRC721EthManger: 'User approve bridge to burn tokens',
  lockHRC721Token: 'Bridge lock tokens on Harmony',
  unlockHRC721Token: 'Bridge unlocks tokens on Harmony',
  burnHRC721Token: 'Bridge burn tokens on Ethereum',
  mintHRC721Token: 'Bridge mint tokens on Ethereum',
  unlockHRC721TokenRollback: 'Mint failed, unlocking tokens on Harmony',
  mintHRC721TokenRollback: 'Unlock failed, minting back the burned tokens on Ethereum',

  // HRC1155
  getHRC1155Address: 'Register user HRC1155 on Ethereum',
  approveHRC1155HmyManger: 'User approve bridge to lock tokens',
  approveHRC1155EthManger: 'User approve bridge to burn tokens',
  lockHRC1155Token: 'Bridge lock tokens on Harmony',
  unlockHRC1155Token: 'Bridge unlocks tokens on Harmony',
  burnHRC1155Token: 'Bridge burn tokens on Ethereum',
  mintHRC1155Token: 'Bridge mint tokens on Ethereum',
  unlockHRC1155TokenRollback: 'Mint failed, unlocking tokens on Harmony',
  mintHRC1155TokenRollback: 'Unlock failed, minting back the burned tokens on Ethereum',

  // ERC721
  getERC721Address: 'Register user ERC721 on Harmony',
  approveERC721HmyManger: 'User approve bridge to lock tokens',
  approveERC721EthManger: 'User approve bridge to burn tokens',
  lockERC721Token: 'Bridge lock tokens on Ethereum',
  unlockERC721Token: 'Bridge unlocks tokens on Ethereum',
  burnERC721Token: 'Bridge burn tokens on Harmony',
  mintERC721Token: 'Bridge mint tokens on Harmony',
  unlockERC721TokenRollback: 'Mint failed, unlocking tokens on Ethereum',
  mintERC721TokenRollback: 'Unlock failed, minting back the burned tokens on Harmony',

  // ERC1155
  getERC1155Address: 'Register user ERC1155 on Harmony',
  approveERC1155HmyManger: 'User approve bridge to burn tokens',
  approveERC1155EthManger: 'User approve bridge to lock tokens',
  lockERC1155Token: 'Bridge lock tokens on Ethereum',
  unlockERC1155Token: 'Bridge unlocks tokens on Ethereum',
  burnERC1155Token: 'Bridge burn tokens on Harmony',
  mintERC1155Token: 'Bridge mint tokens on Harmony',
  unlockERC1155TokenRollback: 'Mint failed, unlocking tokens on Ethereum',
  mintERC1155TokenRollback: 'Unlock failed, minting back the burned tokens on Harmony',
};

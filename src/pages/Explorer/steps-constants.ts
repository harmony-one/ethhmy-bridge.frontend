import { ACTION_TYPE, TOKEN } from 'stores/interfaces';

export const getStepsTitle = (action: ACTION_TYPE, token: TOKEN) => {
  if ((token === TOKEN.ERC721 || token === TOKEN.HRC721) && action === ACTION_TYPE.getHRC20Address) {
    return 'Get HRC721 token';
  }

  return STEPS_TITLE[action];
};

const STEPS_TITLE: Record<ACTION_TYPE, string> = {
  depositOne: 'Deposit tokens',
  withdrawOne: 'Withdraw tokens',

  getHRC20Address: 'Get HRC20 token',
  approveEthManger: 'Approve lock',
  lockToken: 'Lock tokens',
  waitingBlockNumber: 'Wait for finality',
  mintToken: 'Mint tokens',
  mintTokenRollback: 'Mint tokens (rollback)',
  topUpAccount: 'Top up user account',

  // ONE TO ETH
  approveHmyManger: 'Approve burn',
  burnToken: 'Burn tokens',
  waitingBlockNumberHarmony: 'Wait for finality',
  unlockToken: 'Unlock tokens',
  unlockTokenRollback: 'Unlock tokens (rollback)',

  // HRC20
  approveHRC20HmyManger: 'Approve lock',
  approveHRC20EthManger: 'Approve burn',
  getERC20Address: 'Get ERC20 token',
  lockHRC20Token: 'Lock tokens',
  unlockHRC20Token: 'Unlock tokens',
  burnHRC20Token: 'Burn tokens',
  mintHRC20Token: 'Mint tokens',
  unlockHRC20TokenRollback: 'Unlock tokens (rollback)',
  mintHRC20TokenRollback: 'Mint tokens (rollback)',

  // HRC721
  getHRC721Address: 'Get HRC721 token',
  approveHRC721HmyManger: 'Approve lock',
  approveHRC721EthManger: 'Approve burn',
  lockHRC721Token: 'Lock tokens',
  unlockHRC721Token: 'Unlock tokens',
  burnHRC721Token: 'Burn tokens',
  mintHRC721Token: 'Mint tokens',
  unlockHRC721TokenRollback: 'Unlock tokens (rollback)',
  mintHRC721TokenRollback: 'Mint tokens (rollback)',

  // HRC1155
  getHRC1155Address: 'Get HRC1155 token',
  approveHRC1155HmyManger: 'Approve lock',
  approveHRC1155EthManger: 'Approve burn',
  lockHRC1155Token: 'Lock tokens',
  unlockHRC1155Token: 'Unlock tokens',
  burnHRC1155Token: 'Burn tokens',
  mintHRC1155Token: 'Mint tokens',
  unlockHRC1155TokenRollback: 'Unlock tokens (rollback)',
  mintHRC1155TokenRollback: 'Mint tokens (rollback)',

  // ERC1155
  getERC1155Address: 'Get ERC1155 token',
  approveERC1155HmyManger: 'Approve lock',
  approveERC1155EthManger: 'Approve burn',
  lockERC1155Token: 'Lock tokens',
  unlockERC1155Token: 'Unlock tokens',
  burnERC1155Token: 'Burn tokens',
  mintERC1155Token: 'Mint tokens',
  unlockERC1155TokenRollback: 'Unlock tokens (rollback)',
  mintERC1155TokenRollback: 'Mint tokens (rollback)',
};

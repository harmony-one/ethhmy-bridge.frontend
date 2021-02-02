import { ACTION_TYPE, TOKEN } from 'stores/interfaces';

export const getStepsTitle = (action: ACTION_TYPE, token: TOKEN) => {
  if (token === TOKEN.ERC721 && action === ACTION_TYPE.getHRC20Address) {
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
};

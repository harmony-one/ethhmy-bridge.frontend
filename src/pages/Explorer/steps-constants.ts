import { ACTION_TYPE } from 'stores/interfaces';

export const STEPS_TITLE: Record<ACTION_TYPE, string> = {
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
};

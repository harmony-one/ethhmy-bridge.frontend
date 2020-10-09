import { ACTION_TYPE } from 'stores/interfaces';

export const STEPS_TITLE: Record<ACTION_TYPE, string> = {
  getHRC20Address: 'Get HRC20 token',
  approveEthManger: 'Approve manager',
  lockToken: 'Lock token',
  waitingBlockNumber: 'Wait blocks confirming',
  mintToken: 'Mint Tokens',
  mintTokenRollback: 'Mint Tokens (rollback)',

  // ONE TO ETH
  approveHmyManger: 'Approve manager',
  burnToken: 'Burn tokens',
  waitingBlockNumberHarmony: 'Wait blocks confirming',
  unlockToken: 'Unlock tokens',
  unlockTokenRollback: 'Unlock tokens (rollback)',
};

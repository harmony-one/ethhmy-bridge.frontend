import { ACTION_TYPE } from 'stores/interfaces';

export const STEPS_TITLE: Record<ACTION_TYPE, string> = {
  getHRC20Address: 'Get or create HRC20 token address',
  approveEthManger: 'User approve Eth manager to lock tokens',
  lockToken: 'Wait sufficient to confirm the transaction went through',
  waitingBlockNumber: 'Wait while 13 blocks will be confirmed',
  mintToken: 'Mint ONE Tokens',
  mintTokenRollback: 'Mint ONE Tokens (rollback)',

  // ONE TO ETH
  approveHmyManger: 'User needs to approve Harmony manager to burn token',
  burnToken: 'Harmony burn tokens, transaction is confirmed instantaneously',
  unlockToken: 'Eth manager unlock tokens',
  unlockTokenRollback: 'Eth manager unlock tokens (rollback)',
};

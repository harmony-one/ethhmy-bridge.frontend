import { ACTION_TYPE } from 'stores/interfaces';

export const STEPS_TITLE: Record<ACTION_TYPE, string> = {
  getHRC20Address: 'Get HRC20 token',
  approveEthManger: 'Approve manager',
  lockToken: 'Lock token',
  waitingBlockNumber: 'Wait blocks confirming',
  mintToken: 'Mint Tokens',

  // ONE TO ETH
  approveHmyManger: 'Approve manager',
  burnToken: 'Burn tokens',
  unlockToken: 'Unlock tokens',
};

import { ACTION_TYPE } from 'stores/interfaces';

export const STEPS_TITLE: Record<ACTION_TYPE, string> = {
  approveEthManger: 'Ethereum: Approve manager',
  lockToken: 'Ethereum: Lock token',
  waitingBlockNumber: 'Ethereum: Wait blocks confirming',
  mintToken: 'Harmony: Mint Tokens',

  // ONE TO ETH
  approveHmyManger: 'Harmony: Approve manager',
  burnToken: 'Harmony: Burn tokens',
  unlockToken: 'Ethereum: Unlock tokens',
};

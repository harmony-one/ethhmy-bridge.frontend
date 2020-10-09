import { ACTION_TYPE } from 'stores/interfaces';

export const STEPS_TITLE: Record<ACTION_TYPE, string> = {
  getHRC20Address: 'Register user ERC20 on Harmony',
  approveEthManger: 'User approve bridge to lock tokens ',
  lockToken: 'Bridge lock tokens on Ethereum',
  waitingBlockNumber: 'Wait for 13 block confirmations',
  mintToken: 'Bridge mint tokens on Harmony',
  mintTokenRollback: 'Mint failed, unlocking tokens on Ethereum',

  // ONE TO ETH
  approveHmyManger: 'User approve bridge to burn tokens',
  burnToken: 'Bridge burn tokens on Harmony',
  waitingBlockNumberHarmony: 'Wait for 13 block confirmations',
  unlockToken: 'Bridge unlocks tokens on Ethereum',
  unlockTokenRollback: 'Unlock failed, minting back the burned tokens on Harmony',
};

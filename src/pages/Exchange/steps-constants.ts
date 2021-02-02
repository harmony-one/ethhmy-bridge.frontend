import { ACTION_TYPE, TOKEN } from 'stores/interfaces';

export const getStepsTitle = (action: ACTION_TYPE, token: TOKEN) => {
  if (token === TOKEN.ERC721 && action === ACTION_TYPE.getHRC20Address) {
    return 'Register user ERC72 on Harmony';
  }

  return STEPS_TITLE[action];
};

const STEPS_TITLE: Record<ACTION_TYPE, string> = {
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
};

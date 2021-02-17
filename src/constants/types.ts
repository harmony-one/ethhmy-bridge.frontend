export type statusFetching = 'init' | 'fetching' | 'success' | 'error' | 'first_fetching';

export enum SwapStatus {
  SWAP_UNSIGNED = 1,
  SWAP_SIGNED,
  SWAP_SUBMITTED,
  SWAP_CONFIRMED,
  SWAP_FAILED,
  SWAP_RETRY,
  SWAP_WAIT_SEND,
  SWAP_WAIT_APPROVE,
  SWAP_SENT,
}

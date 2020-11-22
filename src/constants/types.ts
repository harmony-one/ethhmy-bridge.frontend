export type statusFetching =
  | 'init'
  | 'fetching'
  | 'success'
  | 'error'
  | 'first_fetching';

//class Status(Enum):
//     SWAP_UNSIGNED = auto()
//     SWAP_SIGNED = auto()
//     SWAP_SUBMITTED = auto()  # Submitted to Secret
//     SWAP_CONFIRMED = auto()
//     SWAP_FAILED = auto()
//     SWAP_RETRY = auto()
export enum SwapStatus {
  SWAP_UNSIGNED = 1,
  SWAP_SIGNED,
  SWAP_SUBMITTED,
  SWAP_CONFIRMED,
  SWAP_FAILED,
  SWAP_RETRY,
  SWAP_WAIT_SEND,
  SWAP_WAIT_APPROVE,
  SWAP_SENT
}

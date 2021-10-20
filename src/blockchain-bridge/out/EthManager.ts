import { AbiItem } from 'web3-utils';

export const abi: AbiItem[] = [
  {
    'inputs': [
      {
        'internalType': 'address',
        'name': '_wallet',
        'type': 'address',
      },
    ],
    'payable': false,
    'stateMutability': 'nonpayable',
    'type': 'constructor',
  },
  {
    'anonymous': false,
    'inputs': [
      {
        'indexed': true,
        'internalType': 'address',
        'name': 'token',
        'type': 'address',
      },
      {
        'indexed': true,
        'internalType': 'address',
        'name': 'sender',
        'type': 'address',
      },
      {
        'indexed': false,
        'internalType': 'uint256',
        'name': 'amount',
        'type': 'uint256',
      },
      {
        'indexed': false,
        'internalType': 'address',
        'name': 'recipient',
        'type': 'address',
      },
    ],
    'name': 'Locked',
    'type': 'event',
  },
  {
    'anonymous': false,
    'inputs': [
      {
        'indexed': false,
        'internalType': 'address',
        'name': 'ethToken',
        'type': 'address',
      },
      {
        'indexed': false,
        'internalType': 'uint256',
        'name': 'amount',
        'type': 'uint256',
      },
      {
        'indexed': false,
        'internalType': 'address',
        'name': 'recipient',
        'type': 'address',
      },
      {
        'indexed': false,
        'internalType': 'bytes32',
        'name': 'receiptId',
        'type': 'bytes32',
      },
    ],
    'name': 'Unlocked',
    'type': 'event',
  },
  {
    'constant': true,
    'inputs': [],
    'name': 'ETH_ADDRESS',
    'outputs': [
      {
        'internalType': 'contract IERC20',
        'name': '',
        'type': 'address',
      },
    ],
    'payable': false,
    'stateMutability': 'view',
    'type': 'function',
  },
  {
    'constant': true,
    'inputs': [
      {
        'internalType': 'bytes32',
        'name': '',
        'type': 'bytes32',
      },
    ],
    'name': 'usedEvents_',
    'outputs': [
      {
        'internalType': 'bool',
        'name': '',
        'type': 'bool',
      },
    ],
    'payable': false,
    'stateMutability': 'view',
    'type': 'function',
  },
  {
    'constant': true,
    'inputs': [],
    'name': 'wallet',
    'outputs': [
      {
        'internalType': 'address',
        'name': '',
        'type': 'address',
      },
    ],
    'payable': false,
    'stateMutability': 'view',
    'type': 'function',
  },
  {
    'constant': false,
    'inputs': [
      {
        'internalType': 'uint256',
        'name': 'amount',
        'type': 'uint256',
      },
      {
        'internalType': 'address',
        'name': 'recipient',
        'type': 'address',
      },
    ],
    'name': 'lockEth',
    'outputs': [],
    'payable': true,
    'stateMutability': 'payable',
    'type': 'function',
  },
  {
    'constant': false,
    'inputs': [
      {
        'internalType': 'uint256',
        'name': 'amount',
        'type': 'uint256',
      },
      {
        'internalType': 'address payable',
        'name': 'recipient',
        'type': 'address',
      },
      {
        'internalType': 'bytes32',
        'name': 'receiptId',
        'type': 'bytes32',
      },
    ],
    'name': 'unlockEth',
    'outputs': [],
    'payable': false,
    'stateMutability': 'nonpayable',
    'type': 'function',
  },
];

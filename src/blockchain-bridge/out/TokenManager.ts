import { AbiItem } from 'web3-utils';

export const abi: AbiItem[] = [
  {
    'anonymous': false,
    'inputs': [
      {
        'indexed': true,
        'internalType': 'address',
        'name': 'previousOwner',
        'type': 'address',
      },
      {
        'indexed': true,
        'internalType': 'address',
        'name': 'newOwner',
        'type': 'address',
      },
    ],
    'name': 'OwnershipTransferred',
    'type': 'event',
  },
  {
    'anonymous': false,
    'inputs': [
      {
        'indexed': true,
        'internalType': 'address',
        'name': 'tokenReq',
        'type': 'address',
      },
      {
        'indexed': true,
        'internalType': 'address',
        'name': 'tokenAck',
        'type': 'address',
      },
    ],
    'name': 'TokenMapAck',
    'type': 'event',
  },
  {
    'constant': true,
    'inputs': [],
    'name': 'isOwner',
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
    'inputs': [
      {
        'internalType': 'address',
        'name': '',
        'type': 'address',
      },
    ],
    'name': 'mappedTokens',
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
    'constant': true,
    'inputs': [],
    'name': 'owner',
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
    'inputs': [],
    'name': 'renounceOwnership',
    'outputs': [],
    'payable': false,
    'stateMutability': 'nonpayable',
    'type': 'function',
  },
  {
    'constant': false,
    'inputs': [
      {
        'internalType': 'address',
        'name': 'newOwner',
        'type': 'address',
      },
    ],
    'name': 'transferOwnership',
    'outputs': [],
    'payable': false,
    'stateMutability': 'nonpayable',
    'type': 'function',
  },
  {
    'constant': true,
    'inputs': [
      {
        'internalType': 'address',
        'name': '',
        'type': 'address',
      },
    ],
    'name': 'wards',
    'outputs': [
      {
        'internalType': 'uint256',
        'name': '',
        'type': 'uint256',
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
        'internalType': 'address',
        'name': 'guy',
        'type': 'address',
      },
    ],
    'name': 'rely',
    'outputs': [],
    'payable': false,
    'stateMutability': 'nonpayable',
    'type': 'function',
  },
  {
    'constant': false,
    'inputs': [
      {
        'internalType': 'address',
        'name': 'guy',
        'type': 'address',
      },
    ],
    'name': 'deny',
    'outputs': [],
    'payable': false,
    'stateMutability': 'nonpayable',
    'type': 'function',
  },
  {
    'constant': false,
    'inputs': [
      {
        'internalType': 'address',
        'name': 'ethTokenAddr',
        'type': 'address',
      },
      {
        'internalType': 'string',
        'name': 'name',
        'type': 'string',
      },
      {
        'internalType': 'string',
        'name': 'symbol',
        'type': 'string',
      },
      {
        'internalType': 'uint8',
        'name': 'decimals',
        'type': 'uint8',
      },
    ],
    'name': 'addToken',
    'outputs': [
      {
        'internalType': 'address',
        'name': '',
        'type': 'address',
      },
    ],
    'payable': false,
    'stateMutability': 'nonpayable',
    'type': 'function',
  },
  {
    'constant': false,
    'inputs': [
      {
        'internalType': 'address',
        'name': 'ethTokenAddr',
        'type': 'address',
      },
      {
        'internalType': 'address',
        'name': 'oneTokenAddr',
        'type': 'address',
      },
    ],
    'name': 'registerToken',
    'outputs': [
      {
        'internalType': 'bool',
        'name': '',
        'type': 'bool',
      },
    ],
    'payable': false,
    'stateMutability': 'nonpayable',
    'type': 'function',
  },
  {
    'constant': false,
    'inputs': [
      {
        'internalType': 'address',
        'name': 'ethTokenAddr',
        'type': 'address',
      },
      {
        'internalType': 'uint256',
        'name': 'supply',
        'type': 'uint256',
      },
    ],
    'name': 'removeToken',
    'outputs': [],
    'payable': false,
    'stateMutability': 'nonpayable',
    'type': 'function',
  },
];

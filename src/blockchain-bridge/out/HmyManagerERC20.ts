import { AbiItem } from 'web3-utils';

export const abi: AbiItem[] = [
  {
    'inputs': [],
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
    'name': 'Burned',
    'type': 'event',
  },
  {
    'anonymous': false,
    'inputs': [
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
    'name': 'Minted',
    'type': 'event',
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
    'name': 'mappings',
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
    'constant': true,
    'inputs': [],
    'name': 'threshold',
    'outputs': [
      {
        'internalType': 'uint16',
        'name': '',
        'type': 'uint16',
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
        'internalType': 'uint16',
        'name': 'newTheshold',
        'type': 'uint16',
      },
    ],
    'name': 'changeThreshold',
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
        'name': 'tokenManager',
        'type': 'address',
      },
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
        'name': 'tokenManager',
        'type': 'address',
      },
      {
        'internalType': 'address',
        'name': 'ethTokenAddr',
        'type': 'address',
      },
    ],
    'name': 'removeToken',
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
        'name': 'oneToken',
        'type': 'address',
      },
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
    'name': 'burnToken',
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
        'name': 'oneToken',
        'type': 'address',
      },
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
      {
        'internalType': 'bytes32',
        'name': 'receiptId',
        'type': 'bytes32',
      },
    ],
    'name': 'mintToken',
    'outputs': [],
    'payable': false,
    'stateMutability': 'nonpayable',
    'type': 'function',
  },
];

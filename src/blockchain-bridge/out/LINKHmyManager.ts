import { AbiItem } from 'web3-utils';

export const abi: AbiItem[] = [
  {
    'inputs': [
      {
        'internalType': 'contract ILINK',
        'name': '_hLINK',
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
    'inputs': [],
    'name': 'hLINK',
    'outputs': [
      {
        'internalType': 'contract ILINK',
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
        'name': 'eLINK',
        'type': 'address',
      },
    ],
    'name': 'register',
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
        'name': 'eLINK',
        'type': 'address',
      },
    ],
    'name': 'deregister',
    'outputs': [],
    'payable': false,
    'stateMutability': 'nonpayable',
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

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
        'name': 'tokenId',
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
        'internalType': 'address',
        'name': 'oneToken',
        'type': 'address',
      },
      {
        'indexed': false,
        'internalType': 'uint256',
        'name': 'tokenId',
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
        'name': 'tokenId',
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
        'internalType': 'uint256[]',
        'name': 'tokenIds',
        'type': 'uint256[]',
      },
      {
        'internalType': 'address',
        'name': 'recipient',
        'type': 'address',
      },
    ],
    'name': 'burnTokens',
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
        'name': 'tokenId',
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
  {
    'constant': false,
    'inputs': [
      {
        'internalType': 'address',
        'name': 'oneToken',
        'type': 'address',
      },
      {
        'internalType': 'uint256[]',
        'name': 'tokenIds',
        'type': 'uint256[]',
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
    'name': 'mintTokens',
    'outputs': [],
    'payable': false,
    'stateMutability': 'nonpayable',
    'type': 'function',
  },
];

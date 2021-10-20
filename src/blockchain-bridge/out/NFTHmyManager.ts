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
    'name': 'Unlocked',
    'type': 'event',
  },
  {
    'constant': false,
    'inputs': [
      {
        'internalType': 'address',
        'name': '',
        'type': 'address',
      },
      {
        'internalType': 'address',
        'name': '',
        'type': 'address',
      },
      {
        'internalType': 'uint256[]',
        'name': '',
        'type': 'uint256[]',
      },
      {
        'internalType': 'uint256[]',
        'name': '',
        'type': 'uint256[]',
      },
      {
        'internalType': 'bytes',
        'name': '',
        'type': 'bytes',
      },
    ],
    'name': 'onERC1155BatchReceived',
    'outputs': [
      {
        'internalType': 'bytes4',
        'name': '',
        'type': 'bytes4',
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
        'name': '',
        'type': 'address',
      },
      {
        'internalType': 'address',
        'name': '',
        'type': 'address',
      },
      {
        'internalType': 'uint256',
        'name': '',
        'type': 'uint256',
      },
      {
        'internalType': 'uint256',
        'name': '',
        'type': 'uint256',
      },
      {
        'internalType': 'bytes',
        'name': '',
        'type': 'bytes',
      },
    ],
    'name': 'onERC1155Received',
    'outputs': [
      {
        'internalType': 'bytes4',
        'name': '',
        'type': 'bytes4',
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
        'name': '',
        'type': 'address',
      },
      {
        'internalType': 'address',
        'name': '',
        'type': 'address',
      },
      {
        'internalType': 'uint256',
        'name': '',
        'type': 'uint256',
      },
      {
        'internalType': 'bytes',
        'name': '',
        'type': 'bytes',
      },
    ],
    'name': 'onERC721Received',
    'outputs': [
      {
        'internalType': 'bytes4',
        'name': '',
        'type': 'bytes4',
      },
    ],
    'payable': false,
    'stateMutability': 'nonpayable',
    'type': 'function',
  },
  {
    'constant': true,
    'inputs': [
      {
        'internalType': 'bytes4',
        'name': 'interfaceID',
        'type': 'bytes4',
      },
    ],
    'name': 'supportsInterface',
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
        'name': 'ethTokenAddr',
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
    'name': 'lockNFT721Token',
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
        'internalType': 'uint256',
        'name': 'amount',
        'type': 'uint256',
      },
      {
        'internalType': 'bytes',
        'name': 'data',
        'type': 'bytes',
      },
    ],
    'name': 'lockNFT1155Token',
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
    'name': 'lockTokens',
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
    'name': 'lockNFT1155Tokens',
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
    'name': 'unlockToken',
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
    'name': 'unlockNFT1155Token',
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
    'name': 'unlockTokens',
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
    'name': 'unlockNFT1155Tokens',
    'outputs': [],
    'payable': false,
    'stateMutability': 'nonpayable',
    'type': 'function',
  },
];

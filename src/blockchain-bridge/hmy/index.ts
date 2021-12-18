import Web3 from 'web3';
import { HmyMethods } from './HmyMethods';
import { HmyMethodsDeposit } from './HmyMethodsDeposit';
import { HmyMethodsWeb3 } from './HmyMethodsWeb3';
import { HmyMethodsDepositWeb3 } from './HmyMethodsDepositWeb3';
import { HmyMethodsERC20 } from './HmyMethodsERC20';
import { HmyMethodsHRC20 } from './HmyMethodsHRC20';
import { HmyMethodsERC20Web3 } from './HmyMethodsERC20Web3';
import { HmyMethodsHRC20Web3 } from './HmyMethodsHRC20Web3';
import { HmyMethodsHRC721Web3 } from './HmyMethodsHRC721Web3';
import { HmyMethodsHRC721 } from './HmyMethodsHRC721';
import { HmyMethodsHRC1155 } from './HmyMethodsHRC1155';
import { HmyMethodsHRC1155Web3 } from './HmyMethodsHRC1155Web3';
import { HmyMethodsERC1155 } from './HmyMethodsERC1155';
import { HmyMethodsERC1155Web3 } from './HmyMethodsERC1155Web3';

const { Harmony } = require('@harmony-js/core');
const { ChainType } = require('@harmony-js/utils');

export const hmy = new Harmony(
  // let's assume we deploy smart contract to this end-point URL
  process.env.HMY_NODE_URL,
  {
    chainType: ChainType.Harmony,
    chainId: Number(process.env.HMY_CHAIN_ID),
  },
);

// @ts-ignore
const web3URL = window.ethereum ? window.ethereum : process.env.HMY_NODE_URL;

export const hmyWeb3 = new Web3(web3URL);

const createContract = (abi, address) => {
  const hmyContract = hmy.contracts.createContract(abi, address);

  const web3Contract = new hmyWeb3.eth.Contract(abi, address);

  return {
    hmyContract,
    web3Contract,
  };
};

const createMethods = (
  hmyTokenContract: any,
  hmyManagerContract: any,
  hmyManagerContractAddress,
) => {
  const hmyMethods = new HmyMethods({
    hmy: hmy,
    hmyTokenContract: hmyTokenContract.hmyContract,
    hmyManagerContract: hmyManagerContract.hmyContract,
  });

  const hmyMethodsWeb3 = new HmyMethodsWeb3({
    web3: hmyWeb3,
    hmyTokenContract: hmyTokenContract.web3Contract,
    hmyManagerContract: hmyManagerContract.web3Contract,
    hmyManagerContractAddress,
  });

  return {
    hmyMethods,
    hmyMethodsWeb3,
  };
};

const hmyBUSDJson = require('../out/MyERC20');
const hmyBUSDManagerJson = require('../out/LINKHmyManager');
const hmyBUSDContract = createContract(
  hmyBUSDJson.abi,
  process.env.HMY_BUSD_CONTRACT,
);
const hmyBUSDManagerContract = createContract(
  hmyBUSDManagerJson.abi,
  process.env.HMY_BUSD_MANAGER_CONTRACT,
);
const hmyLINKContract = createContract(
  hmyBUSDJson.abi,
  process.env.HMY_LINK_CONTRACT,
);
const hmyLINKManagerContract = createContract(
  hmyBUSDManagerJson.abi,
  process.env.HMY_LINK_MANAGER_CONTRACT,
);

export const hmyMethodsBUSD = createMethods(
  hmyBUSDContract,
  hmyBUSDManagerContract,
  process.env.HMY_BUSD_MANAGER_CONTRACT,
);
export const hmyMethodsLINK = createMethods(
  hmyLINKContract,
  hmyLINKManagerContract,
  process.env.HMY_LINK_MANAGER_CONTRACT,
);

const hmyManagerJson = require('../out/HmyManagerERC20');
const hmyManagerJsonHrc20 = require('../out/HmyManagerHRC20');
const hmyManagerJsonHrc721 = require('../out/NFTHmyManager');
const hmyManagerJsonHrc1155 = require('../out/HRC1155HmyManager');
const hmyManagerJsonErc1155 = require('../out/ERC1155HmyManager');
const hmyManagerJson721 = require('../out/ERC721HmyManager');

// ================= ERC20 =================
const hmyManagerContract = createContract(
  hmyManagerJson.abi,
  process.env.HMY_ERC20_MANAGER_CONTRACT,
);

export const hmyMethodsERC20Hmy = new HmyMethodsERC20({
  hmy: hmy,
  hmyManagerContract: hmyManagerContract.hmyContract,
  hmyTokenManagerAddress: process.env.TOKEN_MANAGER_CONTRACT,
});

export const hmyMethodsERC20Web3 = new HmyMethodsERC20Web3({
  web3: hmyWeb3,
  hmyManagerContract: hmyManagerContract.web3Contract,
  hmyManagerContractAddress: process.env.HMY_ERC20_MANAGER_CONTRACT,
  hmyTokenManagerAddress: process.env.TOKEN_MANAGER_CONTRACT,
});

export const hmyMethodsERC20 = {
  hmyMethods: hmyMethodsERC20Hmy,
  hmyMethodsWeb3: hmyMethodsERC20Web3,
};

// ================= BEP20 =================
const hmyManagerContractBEP20 = createContract(
  hmyManagerJson.abi,
  process.env.HMY_BRIDGE_MANAGER,
);

export const hmyMethodsBEP20Hmy = new HmyMethodsERC20({
  hmy: hmy,
  hmyManagerContract: hmyManagerContractBEP20.hmyContract,
  hmyTokenManagerAddress: process.env.TOKEN_MANAGER_CONTRACT_FOR_BSC,
});

export const hmyMethodsBEP20Web3 = new HmyMethodsERC20Web3({
  web3: hmyWeb3,
  hmyManagerContract: hmyManagerContractBEP20.web3Contract,
  hmyManagerContractAddress: process.env.HMY_BRIDGE_MANAGER,
  hmyTokenManagerAddress: process.env.TOKEN_MANAGER_CONTRACT_FOR_BSC,
});

export const hmyMethodsBEP20 = {
  hmyMethods: hmyMethodsBEP20Hmy,
  hmyMethodsWeb3: hmyMethodsBEP20Web3,
};

// ================= HRC20 =================
const hmyManagerContractHrc20 = createContract(
  hmyManagerJsonHrc20.abi,
  process.env.HMY_HRC20_MANAGER_CONTRACT,
);

export const hmyMethodsHRC20Hmy = new HmyMethodsHRC20({
  hmy: hmy,
  hmyManagerContract: hmyManagerContractHrc20.hmyContract,
});

export const hmyMethodsHRC20Web3 = new HmyMethodsHRC20Web3({
  web3: hmyWeb3,
  hmyManagerContract: hmyManagerContractHrc20.web3Contract,
  hmyManagerContractAddress: process.env.HMY_HRC20_MANAGER_CONTRACT,
});

export const hmyMethodsHRC20 = {
  hmyMethods: hmyMethodsHRC20Hmy,
  hmyMethodsWeb3: hmyMethodsHRC20Web3,
};

// ================= BHRC20 =================
const hmyManagerContractBHrc20 = createContract(
  hmyManagerJsonHrc20.abi,
  process.env.HMY_BRIDGE_MANAGER,
);

export const hmyMethodsBHRC20Hmy = new HmyMethodsHRC20({
  hmy: hmy,
  hmyManagerContract: hmyManagerContractBHrc20.hmyContract,
});

export const hmyMethodsBHRC20Web3 = new HmyMethodsHRC20Web3({
  web3: hmyWeb3,
  hmyManagerContract: hmyManagerContractBHrc20.web3Contract,
  hmyManagerContractAddress: process.env.HMY_BRIDGE_MANAGER,
});

export const hmyMethodsBHRC20 = {
  hmyMethods: hmyMethodsBHRC20Hmy,
  hmyMethodsWeb3: hmyMethodsBHRC20Web3,
};

// const hmySubManagerContract = createContract(
//   hmyManagerJson.abi,
//   process.env.HMY_ERC20_SUB_MANAGER_CONTRACT,
// );

// export const hmyMethodsERC20SUBHmy = new HmyMethodsERC20({
//   hmy: hmy,
//   hmyManagerContract: hmySubManagerContract.hmyContract,
// });

// export const hmyMethodsSubERC20Web3 = new HmyMethodsERC20Web3({
//   web3: hmyWeb3,
//   hmyManagerContract: hmySubManagerContract.web3Contract,
//   hmyManagerContractAddress: process.env.HMY_ERC20_SUB_MANAGER_CONTRACT,
// });

// export const hmyMethodsERC20SUB = {
//   hmyMethods: hmyMethodsERC20SUBHmy,
//   hmyMethodsWeb3: hmyMethodsSubERC20Web3,
// };

// const hmySubManagerContractBEP20 = createContract(
//   hmyManagerJson.abi,
//   process.env.HMY_BEP20_SUB_MANAGER_CONTRACT,
// );

// export const hmyMethodsBEP20SUBHmy = new HmyMethodsERC20({
//   hmy: hmy,
//   hmyManagerContract: hmySubManagerContractBEP20.hmyContract,
// });

// export const hmyMethodsSubBEP20Web3 = new HmyMethodsERC20Web3({
//   web3: hmyWeb3,
//   hmyManagerContract: hmySubManagerContractBEP20.web3Contract,
//   hmyManagerContractAddress: process.env.HMY_BEP20_SUB_MANAGER_CONTRACT,
// });

// export const hmyMethodsBEP20SUB = {
//   hmyMethods: hmyMethodsBEP20SUBHmy,
//   hmyMethodsWeb3: hmyMethodsSubBEP20Web3,
// };


// ================= ERC721 =================
const hmyManagerContractERC721 = createContract(
  hmyManagerJson721.abi,
  process.env.HMY_ERC721_MANAGER_CONTRACT,
);

export const hmyMethodsERC721Hmy = new HmyMethodsERC20({
  hmy: hmy,
  hmyManagerContract: hmyManagerContractERC721.hmyContract,
  hmyTokenManagerAddress: process.env.NFT_TOKEN_MANAGER_CONTRACT,
});

export const hmyMethodsERC721Web3 = new HmyMethodsERC20Web3({
  web3: hmyWeb3,
  hmyManagerContract: hmyManagerContractERC721.web3Contract,
  hmyManagerContractAddress: process.env.HMY_ERC721_MANAGER_CONTRACT,
  hmyTokenManagerAddress: process.env.NFT_TOKEN_MANAGER_CONTRACT,
});

export const hmyMethodsERC721 = {
  hmyMethods: hmyMethodsERC721Hmy,
  hmyMethodsWeb3: hmyMethodsERC721Web3,
};

// ================= BEP721 =================
const hmyManagerContractBEP721 = createContract(
  hmyManagerJson721.abi,
  process.env.HMY_BEP721_MANAGER_CONTRACT,
);

export const hmyMethodsBEP721Hmy = new HmyMethodsERC20({
  hmy: hmy,
  hmyManagerContract: hmyManagerContractBEP721.hmyContract,
  hmyTokenManagerAddress: process.env.BEP721_TOKEN_MANAGER_CONTRACT,
});

export const hmyMethodsBEP721Web3 = new HmyMethodsERC20Web3({
  web3: hmyWeb3,
  hmyManagerContract: hmyManagerContractBEP721.web3Contract,
  hmyManagerContractAddress: process.env.HMY_BEP721_MANAGER_CONTRACT,
  hmyTokenManagerAddress: process.env.BEP721_TOKEN_MANAGER_CONTRACT,
});

export const hmyMethodsBEP721 = {
  hmyMethods: hmyMethodsBEP721Hmy,
  hmyMethodsWeb3: hmyMethodsBEP721Web3,
};

// ================= HRC721 =================
const hmyManagerContractHrc721 = createContract(
  hmyManagerJsonHrc721.abi,
  process.env.HMY_HRC721_MANAGER_CONTRACT,
);

export const hmyMethodsHRC721Hmy = new HmyMethodsHRC721({
  hmy: hmy,
  hmyManagerContract: hmyManagerContractHrc721.hmyContract,
});

export const hmyMethodsHRC721Web3 = new HmyMethodsHRC721Web3({
  web3: hmyWeb3,
  hmyManagerContract: hmyManagerContractHrc721.web3Contract,
  hmyManagerContractAddress: process.env.HMY_HRC721_MANAGER_CONTRACT,
});

export const hmyMethodsHRC721 = {
  hmyMethods: hmyMethodsHRC721Hmy,
  hmyMethodsWeb3: hmyMethodsHRC721Web3,
};

// ================= BHRC721 =================
const hmyManagerContractBHrc721 = createContract(
  hmyManagerJsonHrc721.abi,
  process.env.HMY_BHRC721_MANAGER_CONTRACT,
);

export const hmyMethodsBHrc721Hmy = new HmyMethodsHRC721({
  hmy: hmy,
  hmyManagerContract: hmyManagerContractBHrc721.hmyContract,
});

export const hmyMethodsBHrc721Web3 = new HmyMethodsHRC721Web3({
  web3: hmyWeb3,
  hmyManagerContract: hmyManagerContractBHrc721.web3Contract,
  hmyManagerContractAddress: process.env.HMY_BHRC721_MANAGER_CONTRACT,
});

export const hmyMethodsBHrc721 = {
  hmyMethods: hmyMethodsBHrc721Hmy,
  hmyMethodsWeb3: hmyMethodsBHrc721Web3,
};

// ================= ERC1155 =================
const hmyManagerContractErc1155 = createContract(
  hmyManagerJsonErc1155.abi,
  process.env.HMY_ERC1155_MANAGER_CONTRACT,
);

export const hmyMethodsERC1155Hmy = new HmyMethodsERC1155({
  hmy: hmy,
  hmyManagerContract: hmyManagerContractErc1155.hmyContract,
  hmyTokenManagerAddress: process.env.HMY_ERC1155_MANAGER_TOKEN,
});

export const hmyMethodsERC1155Web3 = new HmyMethodsERC1155Web3({
  web3: hmyWeb3,
  hmyManagerContract: hmyManagerContractErc1155.web3Contract,
  hmyManagerContractAddress: process.env.HMY_ERC1155_MANAGER_CONTRACT,
  hmyTokenManagerAddress: process.env.HMY_ERC1155_MANAGER_TOKEN,
});

export const hmyMethodsERC1155 = {
  hmyMethods: hmyMethodsERC1155Hmy,
  hmyMethodsWeb3: hmyMethodsERC1155Web3,
};

// ================= BEP1155 =================
const hmyManagerContractBEP1155 = createContract(
  hmyManagerJsonErc1155.abi,
  process.env.HMY_BEP1155_MANAGER_CONTRACT,
);

export const hmyMethodsBEP1155Hmy = new HmyMethodsERC1155({
  hmy: hmy,
  hmyManagerContract: hmyManagerContractBEP1155.hmyContract,
  hmyTokenManagerAddress: process.env.HMY_BEP1155_MANAGER_TOKEN,
});

export const hmyMethodsBEP1155Web3 = new HmyMethodsERC1155Web3({
  web3: hmyWeb3,
  hmyManagerContract: hmyManagerContractBEP1155.web3Contract,
  hmyManagerContractAddress: process.env.HMY_BEP1155_MANAGER_CONTRACT,
  hmyTokenManagerAddress: process.env.HMY_BEP1155_MANAGER_TOKEN,
});

export const hmyMethodsBEP1155 = {
  hmyMethods: hmyMethodsBEP1155Hmy,
  hmyMethodsWeb3: hmyMethodsBEP1155Web3,
};

// ================= HRC1155 =================
const hmyManagerContractHrc1155 = createContract(
  hmyManagerJsonHrc1155.abi,
  process.env.HMY_HRC1155_MANAGER_CONTRACT,
);

export const hmyMethodsHRC1155Hmy = new HmyMethodsHRC1155({
  hmy: hmy,
  hmyManagerContract: hmyManagerContractHrc1155.hmyContract,
});

export const hmyMethodsHRC1155Web3 = new HmyMethodsHRC1155Web3({
  web3: hmyWeb3,
  hmyManagerContract: hmyManagerContractHrc1155.web3Contract,
  hmyManagerContractAddress: process.env.HMY_HRC1155_MANAGER_CONTRACT,
});

export const hmyMethodsHRC1155 = {
  hmyMethods: hmyMethodsHRC1155Hmy,
  hmyMethodsWeb3: hmyMethodsHRC1155Web3,
};

// ================= BHrc1155 =================
const hmyManagerContractBHrc1155 = createContract(
  hmyManagerJsonHrc1155.abi,
  process.env.HMY_BHRC1155_MANAGER_CONTRACT,
);

export const hmyMethodsBHrc1155Hmy = new HmyMethodsHRC1155({
  hmy: hmy,
  hmyManagerContract: hmyManagerContractBHrc1155.hmyContract,
});

export const hmyMethodsBHrc1155Web3 = new HmyMethodsHRC1155Web3({
  web3: hmyWeb3,
  hmyManagerContract: hmyManagerContractBHrc1155.web3Contract,
  hmyManagerContractAddress: process.env.HMY_BHRC1155_MANAGER_CONTRACT,
});

export const hmyMethodsBHrc1155 = {
  hmyMethods: hmyMethodsBHrc1155Hmy,
  hmyMethodsWeb3: hmyMethodsBHrc1155Web3,
};

const hmyDepositJson = require('../out/Deposit');
const hmyDepositContract = createContract(
  hmyDepositJson.abi,
  process.env.HMY_DEPOSIT_CONTRACT,
);

const hmyMethodsDepositHmy = new HmyMethodsDeposit({
  hmy: hmy,
  hmyManagerContract: hmyDepositContract.hmyContract,
});

const hmyMethodsDepositWeb3 = new HmyMethodsDepositWeb3({
  web3: hmyWeb3,
  hmyManagerContract: hmyDepositContract.web3Contract,
});

export const hmyMethodsDeposit = {
  hmyMethods: hmyMethodsDepositHmy,
  hmyMethodsWeb3: hmyMethodsDepositWeb3,
};

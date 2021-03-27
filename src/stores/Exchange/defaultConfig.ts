import { TConfig, TOKEN } from '../interfaces';

export const defaultEthClient: TConfig = {
  nodeURL: 'https://kovan.infura.io/v3',
  explorerURL: 'https://kovan.etherscan.io',
  tokens: [
    TOKEN.ERC721,
    TOKEN.HRC20,
    TOKEN.BUSD,
    TOKEN.LINK,
    TOKEN.ERC20,
    TOKEN.ONE,
    TOKEN.ETH,
  ],
  contracts: {
    busd: '0xb0e18106520d05adA2C7fcB1a95f7db5e3f28345',
    link: '0x69FcFe4aFF2778d15f186AcF8845a0Dc0ec08CC7',
    busdManager: '0x89Cb9b988ECe933becbA1001aEd98BdAa660Ef29',
    linkManager: '0xe65143628d598F867Ed5139Ff783bA6f33D51bFa',
    erc20Manager: '0xba1f4b06225A2Cf8B56D711539CbbeF1c097a886',
    erc721Manager: '0x364907a5B9ba4A3353B4Dd11aDC0b2bE8AC58253',
    multisigWallet: '0x4D2F08369476F21D4DEB834b6EA9c41ACAd11413',
    tokenManager: '0xAa0fFF0074E898B922DBAb2c7496cdcC84A28fa0',
    hrc20Manager: '0xA64D59E4350f61679ACDE8eEC06421233Bd2B4E1',
    ethManager: '0xCE670B66C5296e29AB39aBECBC92c60ea330F5dC',
    nativeTokenHRC20: '0x268d6fF391B41B36A13B1693BD25f87FB4E4b392',
  },
  gasPrice: 100000000000,
  gasLimit: 150000,
};

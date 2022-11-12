import { TOKEN } from "stores/interfaces";

const api = {
    validators: [
      'https://be1.bridge.hmny.io',
      'https://be2.bridge.hmny.io',
      'https://be3.bridge.hmny.io',
    ],
    threshold: 2, // minimum validators number to do operation
    assetServiceUrl: 'https://be4.bridge.hmny.io', // assets statistic service
  };
  
  const binanceClient = {
    nodeURL: 'https://bsc-dataseed.binance.org/',
    // nodeURL: 'https://bsc-dataseed4.binance.org/',
    // nodeURL: 'https://bsc-dataseed1.defibit.io',
    explorerURL: 'https://bscscan.com/',
    tokens: [TOKEN.ERC20, TOKEN.ONE, TOKEN.ETH, TOKEN.HRC20],
    contracts: {
      multisigWallet: '0x715CdDa5e9Ad30A0cEd14940F9997EE611496De6',
  
      erc20Manager: '0xfD53b1B4AF84D59B20bF2C20CA89a6BeeAa2c628',
      hrc20Manager: '0xfD53b1B4AF84D59B20bF2C20CA89a6BeeAa2c628',
      ethManager: '0xfD53b1B4AF84D59B20bF2C20CA89a6BeeAa2c628',
  
      tokenManager: '0xfE601dE9D4295274b9904D5a9Ad7069F23eE2B32',
      nativeTokenHRC20: '0xb1f6E61E1e113625593a22fa6aa94F8052bc39E0',
  
      busd: '0xa011471158D19854aF08A22839f81321309D4A12',
      busdManager: '0xCC93449c89e8064124FFe1E9d3A84398b4f90ebd',
      link: '0xFEFB4061d5c4F096D29e6ac8e300314b5F00199c',
      linkManager: '0x9EDC8d0Bde1Fc666831Bda1ded5B34A45f9E886C',
      erc721Manager: '0x426A61A2127fDD1318Ec0EdCe02474f382FdAd30',
  
      hrc721Manager: '',
      hrc721TokenManager: '',
  
      hrc1155Manager: '',
      hrc1155TokenManager: '',
  
      erc1155Manager: '',
      erc1155TokenManager: '',
    },
    gasPrice: 6000000000,
    gasLimit: 1000000,
  };
  
  const ethClient = {
    nodeURL: 'https://mainnet.infura.io/v3',
    explorerURL: 'https://etherscan.io',
    tokens: [TOKEN.ERC721, TOKEN.ERC1155, TOKEN.HRC721, TOKEN.HRC1155, TOKEN.HRC20, TOKEN.BUSD, TOKEN.LINK, TOKEN.ERC20, TOKEN.ONE, TOKEN.ETH],
    contracts: {
      busd: '0x4fabb145d64652a948d72533023f6e7a623c7c53',
      link: '0x514910771af9ca656af840dff83e8264ecf986ca',
      busdManager: '0xfD53b1B4AF84D59B20bF2C20CA89a6BeeAa2c628',
      linkManager: '0xfE601dE9D4295274b9904D5a9Ad7069F23eE2B32',
      erc20Manager: '0x2dCCDB493827E15a5dC8f8b72147E6c4A5620857',
      erc721Manager: '0x426A61A2127fDD1318Ec0EdCe02474f382FdAd30',
      multisigWallet: '0x715CdDa5e9Ad30A0cEd14940F9997EE611496De6',
      hrc20Manager: '0x4D34E61CaF7A3622759D69e48CCDeB8dee5021e8',
      tokenManager: '0x1Bd0029385F95AD2584cDFaf5C19F3F20651dEf6',
      ethManager: '0xF9Fb1c508Ff49F78b60d3A96dea99Fa5d7F3A8A6',
      nativeTokenHRC20: '0x6983D1E6DEf3690C4d616b13597A09e6193EA013',
  
      hrc721Manager: '0x117BB501D7e34408d32e152D78ffFbd7FD1aeee5',
      hrc721TokenManager: '0xF837fe0Eba85bE14446E546115ef20891E357D2B',
  
      hrc1155Manager: '0x001Ca6D312843A593251DB4a536Cb408DeD441c5',
      hrc1155TokenManager: '0x487e930e9d296CDDf1D3d51620b3aF0221013DD6',
  
      erc1155Manager: '0x478279c5A0beb8401De1b4EaCB4863a243a8e3A3',
      erc1155TokenManager: '0x94da065b27f4a61d6595c2ebb541bb7bd11b6266',
    },
  };
  
  const hmyClient = {
    nodeURL: 'https://api.s0.t.hmny.io',
    explorerURL: 'https://explorer.harmony.one/#',
    chainId: 1,
    contracts: {
      busd: '0xe176ebe47d621b984a73036b9da5d834411ef734',
      link: '0x218532a12a389a4a92fc0c5fb22901d1c19198aa',
      busdManager: '0x05d11b7082d5634e0318d818a2f0cd381b371ea5',
      linkManager: '0xc0c7b147910ef11f6454dc1918ecde9a2b64a3a8',
      erc20Manager: '0x2fbbcef71544c461edfc311f42e3583d5f9675d1',
      erc20SubManager: '0xef81ab52721abbdae90862ee1ac10c20d3af2d0a',
      erc721Manager: '0x39ec213272dda1f46424726bb20d82c3861568c0',
      depositManager: '0xce3110e4ab757672b0535a9c1410fed80647b693',
    },
  };
  
  export const mainnet = {
    api,
    binanceClient,
    ethClient,
    hmyClient,
  };
  
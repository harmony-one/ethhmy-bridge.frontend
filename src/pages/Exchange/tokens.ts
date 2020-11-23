export const tokens = [
  {
    label: 'TrueUSD (TUSD)',
    secretLabel: 'Secret TrueUSD (sTUSD)',
    href:
      'https://ropsten.etherscan.io/token/0x1cB0906955623920c86A3963593a02a405Bb97fC' /* ropsten */,
    // 'https://etherscan.io/token/0x0000000000085d4780B73119b644AE5ecd22b376' /* mainnet */,
    image: 'https:/etherscan.io/token/images/trueusd_32.png',
    snip20address:
      'secret1ql7lgv73uyftmjmwkfxq6tgw3279zck2hs9zwh' /* holodeck-2 */,
    decimals: 18,
  },
  {
    label: 'Yeenus (YEENUS)',
    secretLabel: 'Secret  Yeenus (sYEENUS)',
    href:
      'https://ropsten.etherscan.io/token/0xF6fF95D53E08c9660dC7820fD5A775484f77183A' /* ropsten */,
    image: 'https://ropsten.etherscan.io/images/main/empty-token.png',
    snip20address:
      'secret1lat3elqezj05wdulkhtqxtugzzye25vprzew0q' /* holodeck-2 */,
    decimals: 8,
  },
].map(t => ({ ...t, address: t.href.split('token/')[1] }));

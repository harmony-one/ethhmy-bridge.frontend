import { BridgeSDK } from 'bridge-sdk';
import * as configs from 'bridge-sdk/lib/configs';

export const bridgeSDK = new BridgeSDK({ logLevel: 0 });

const config =
  process.env.NETWORK === 'mainnet' ? configs.mainnet : configs.testnet;
bridgeSDK.init(config);

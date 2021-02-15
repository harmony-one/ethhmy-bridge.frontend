import preloadedTokens from './tokens.json';
import { TokenDisplay } from './index';
import { SwapToken } from './SwapToken';

export const loadTokensFromList = (network: string): SwapToken[] => {
  return preloadedTokens[network];
};

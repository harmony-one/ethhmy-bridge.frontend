import preloadedTokens from './tokens.json';
import { SwapToken } from '../types/SwapToken';

export const loadTokensFromList = (network: string): SwapToken[] => {
  return preloadedTokens[network];
};

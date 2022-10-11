import { ITokenInfo, TOKEN } from '../stores/interfaces';
import { UsedToken } from '../services';

export const buildTokenId = (token: ITokenInfo) => {
  return `${token.token}:${token.network}:${getAssetOriginAddress(token)}`;
};

export const buildUsedTokenId = (usedToken: UsedToken) => {
  const tokenType = usedToken.token === TOKEN.ONE ? 'hrc20' : usedToken.token;
  return `${tokenType}:${usedToken.network}:${usedToken.originAddress}`;
};

export const getAssetOriginAddress = (data: ITokenInfo) => {
  return data.type.includes('erc') ? data.erc20Address : data.hrc20Address;
};

export const getAssetsMappingAddress = (data: ITokenInfo) => {
  return data.type.includes('hrc') ? data.hrc20Address : data.erc20Address;
};

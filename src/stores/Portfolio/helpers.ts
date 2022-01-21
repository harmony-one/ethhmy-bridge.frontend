import { IOperation, ITokenInfo, TOKEN } from '../interfaces';
import { Tokens } from '../Tokens';

const isTheSameToken = (token, operation) => {
  return (
    (!operation.erc20Address ||
      token.erc20Address === operation.erc20Address) &&
    (!operation.hrc20Address ||
      token.hrc20Address === operation.hrc20Address) &&
    token.network === operation.network
  );
};

export const getTokensFromOperations = (
  operations: IOperation[],
  tokensStore: Tokens,
) => {
  const userTokens: ITokenInfo[] = [];

  operations.forEach(operation => {
    let token;

    switch (operation.token) {
      case TOKEN.ERC20:
      case TOKEN.HRC20:
        if (!!userTokens.find(token => isTheSameToken(token, operation))) {
          return;
        }

        token = tokensStore.allData.find(token =>
          isTheSameToken(token, operation),
        );

        if (!!token) {
          userTokens.push({
            ...token,
            totalLockedUSD: '0',
            totalLocked: '0',
            totalLockedNormal: '0',
            totalSupply: '0',
          });
        } else {
          userTokens.push({
            erc20Address:
              operation.erc20Address ||
              '0x00eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
            hrc20Address:
              operation.hrc20Address ||
              '0x00eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
            name: 'Unknown',
            symbol: 'Unknown',
            decimals: '18',
            token: operation.token,
            type: operation.token,
            network: operation.network,
            totalLockedUSD: '0',
            totalLocked: '0',
            totalLockedNormal: '0',
            totalSupply: '0',
          });
        }

        break;

      case TOKEN.ONE:
        if (
          userTokens.find(
            token =>
              token.hrc20Address === process.env.ONE_HRC20 &&
              token.network === operation.network,
          )
        ) {
          return;
        }

        token = tokensStore.allData.find(
          token =>
            token.hrc20Address === process.env.ONE_HRC20 &&
            token.network === operation.network,
        );

        if (!token) return;

        userTokens.push({
          ...token,
          erc20Address:
            token.erc20Address || '0x00eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
          hrc20Address:
            token.hrc20Address || '0x00eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
          totalLockedUSD: '0',
          totalLocked: '0',
          totalLockedNormal: '0',
          totalSupply: '0',
        });
        break;

      case TOKEN.ETH:
        if (
          userTokens.find(
            token =>
              token.erc20Address === process.env.ONE_HRC20 &&
              token.network === operation.network,
          )
        ) {
          return;
        }

        token = tokensStore.allData.find(
          token =>
            token.erc20Address === process.env.ONE_HRC20 &&
            token.network === operation.network,
        );

        if (!token) return;

        userTokens.push({
          ...token,
          erc20Address:
            token.erc20Address || '0x00eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
          hrc20Address:
            token.hrc20Address || '0x00eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
          totalLockedUSD: '0',
          totalLocked: '0',
          totalLockedNormal: '0',
          totalSupply: '0',
        });
        break;

      default:
        break;
    }
  });

  return userTokens;
};

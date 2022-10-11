import { ITokenInfo, NETWORK_TYPE } from '../interfaces';
import { StoreConstructor } from '../core/StoreConstructor';
import * as services from 'services';
import * as operationService from 'services';
import { validators } from 'services';
import { action, observable } from 'mobx';
import { getTokensFromOperations } from './helpers';
import {
  hmyMethodsHRC20Hmy,
  hmyWeb3,
  initNetwork,
} from '../../blockchain-bridge';

export class Portfolio extends StoreConstructor {
  @observable tokens: ITokenInfo[] = [];

  @action.bound
  async loadOperationList(ethAddress: string, oneAddress: string) {
    const params = {
      ethAddress,
      oneAddress,
    };

    const operations = await services.getOperations(params, validators[0]);

    try {
      this.tokens = getTokensFromOperations(
        operations.content,
        this.stores.tokens,
      );

      this.tokens = await Promise.all(
        this.tokens.map(async token => {
          const balances = await this.loadBalances(
            token,
            ethAddress,
            oneAddress,
          );

          return {
            ...token,
            ...balances,
          };
        }),
      );
    } catch (ex) {
      console.log('### ex', ex);
    }
  }

  async loadBalances(
    token: ITokenInfo,
    ethAddress: string,
    oneAddress: string,
  ) {
    const serviceConfig = await operationService.getConfig();
    const ethNetwork = initNetwork(
      serviceConfig.ethClient,
      process.env.ETH_NODE_URL,
    );

    const binanceNetwork = initNetwork(
      serviceConfig.binanceClient,
      process.env.ETH_NODE_URL,
    );

    const loadHmyBalance = async (token: ITokenInfo, oneAddress: string) => {
      if (token.hrc20Address === process.env.ONE_HRC20) {
        return await hmyWeb3.eth.getBalance(oneAddress).catch(err => {
          return '0';
        });
      }

      return await hmyMethodsHRC20Hmy
        .checkHmyBalance(token.hrc20Address, oneAddress)
        .then(balance => balance.toString())
        .catch(err => {
          return '0';
        });
    };

    const loadEthBalance = (token: ITokenInfo, ethAddress: string) => {
      if (token.network === NETWORK_TYPE.BINANCE) {
        if (token.erc20Address === process.env.ONE_HRC20) {
          return binanceNetwork
            .getEthBalance(ethAddress)
            .then(balance => (Number(balance) * 1e18).toString())
            .catch(err => {
              return '0';
            });
        }

        return binanceNetwork.ethMethodsERC20
          .checkEthBalance(token.erc20Address, ethAddress)
          .catch(err => {
            return '0';
          });
      }

      if (token.erc20Address === '0x00eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') {
        return ethNetwork.getEthBalance(ethAddress).catch(err => {
          return '0';
        });
      }

      return ethNetwork.ethMethodsERC20
        .checkEthBalance(token.erc20Address, ethAddress)
        .catch(err => {
          return '0';
        });
    };

    const hrc20Balance = await loadHmyBalance(token, oneAddress);
    const erc20Balance = await loadEthBalance(token, ethAddress);

    return {
      hrc20Balance,
      erc20Balance,
    };
  }
}

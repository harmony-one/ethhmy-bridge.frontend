import { IOperation, NETWORK_TYPE } from './interfaces';
import { StoreConstructor } from './core/StoreConstructor';
import { IStores } from './index';
import * as services from 'services';
import { ListStoreConstructor } from './core/ListStoreConstructor';
import { action, observable } from 'mobx';
import { validators } from 'services';
import * as operationService from 'services';
import { hmyMethodsHRC20Hmy, initNetwork } from '../blockchain-bridge';
import arrayContaining = jasmine.arrayContaining;

export class Portfolio extends StoreConstructor {
  @observable tokens = {
    hrc20: {},
    erc20: {},
    bep20: {},
  };

  @action.bound
  async loadOperationList(ethAddress: string, oneAddress: string) {
    const params = {
      ethAddress,
      oneAddress,
      status: 'success',
    };
    const operations = await services.getOperations(params, validators[0]);

    try {
      const serviceConfig = await operationService.getConfig();

      const ethNetwork = initNetwork(
        serviceConfig.ethClient,
        process.env.ETH_NODE_URL,
      );
      const binanceNetwork = initNetwork(
        serviceConfig.binanceClient,
        process.env.ETH_NODE_URL,
      );

      operations.content.map(operation => {
        if (operation.hrc20Address && operation.hrc20Address) {
          this.tokens.hrc20[operation.hrc20Address] = 0;
        }

        if (
          operation.network === NETWORK_TYPE.ETHEREUM &&
          operation.erc20Address
        ) {
          this.tokens.erc20[operation.erc20Address] = 0;
        }

        if (
          operation.network === NETWORK_TYPE.BINANCE &&
          operation.erc20Address
        ) {
          this.tokens.bep20[operation.erc20Address] = 0;
        }
      });

      // console.log('### hrc20', hrc20);
      // console.log('### erc20', erc20);
      // console.log('### bep20', bep20);

      await Promise.all(
        Object.keys(this.tokens.erc20).map(address =>
          ethNetwork.ethMethodsERC20
            .checkEthBalance(address, ethAddress)
            .then(balance => (this.tokens.erc20[address] = balance))
            .catch(console.error),
        ),
      );

      const bUSDBalance = await ethNetwork.ethMethodsBUSD.checkEthBalance(
        ethAddress,
      );
      console.log('### balance', bUSDBalance);

      // await ethNetwork.getEthBalance(ethAddress);

      await Promise.all(
        Object.keys(this.tokens.hrc20).map(address =>
          hmyMethodsHRC20Hmy
            .checkHmyBalance(address, ethAddress)
            .then(balance => (this.tokens.hrc20[address] = balance.toString()))
            .catch(console.error),
        ),
      );

      console.log('### this.tokens', this.tokens);
    } catch (ex) {
      console.log('### ex', ex);
    }

    return [];
  }
}

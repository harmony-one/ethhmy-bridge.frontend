import { ACTION_TYPE, EXCHANGE_MODE, IAction, NETWORK_TYPE, STATUS } from '../interfaces';
import { sleep } from '../../utils';
import { ITransaction } from './index';
import { IStores } from '../index';
import {
  hmyMethodsBHRC20,
  hmyMethodsHRC20,
  hmyMethodsHRC721,
  hmyMethodsS0HRC20,
  hmyMethodsS0HRC721,
} from '../../blockchain-bridge/hmy';
import { getExNetworkMethods } from '../../blockchain-bridge/eth';

export const sendHrc20Token = async (params: {
  transaction: ITransaction;
  stores: IStores;
  mode: EXCHANGE_MODE;
  getActionByType: (action: ACTION_TYPE) => IAction;
  confirmCallback: (hash: string, action: ACTION_TYPE) => void;
}) => {
  const {
    getActionByType,
    confirmCallback,
    transaction,
    stores,
    mode,
  } = params;
  const networkMap = {
    [NETWORK_TYPE.ETHEREUM]: hmyMethodsHRC20,
    [NETWORK_TYPE.BINANCE]: hmyMethodsBHRC20,
    [NETWORK_TYPE.HARMONYSHARD1]: hmyMethodsS0HRC20,
  };

  const hmyMethodsBase = networkMap[stores.exchange.network];

  const hmyMethods = stores.user.isMetamask
    ? hmyMethodsBase.hmyMethodsWeb3
    : hmyMethodsBase.hmyMethods;

  const ethMethods = getExNetworkMethods().ethMethodsHRC20;

  if (mode === EXCHANGE_MODE.ETH_TO_ONE) {
    let approveEthManger = getActionByType(ACTION_TYPE.approveHRC20EthManger);

    if (approveEthManger && approveEthManger.status === STATUS.WAITING) {
      ethMethods.approveEthManger(
        stores.userMetamask.erc20Address,
        transaction.approveAmount,
        stores.userMetamask.erc20TokenDetails.decimals,
        hash => confirmCallback(hash, approveEthManger.type),
      );
    }

    while (
      [STATUS.WAITING, STATUS.IN_PROGRESS].includes(approveEthManger.status)
    ) {
      approveEthManger = getActionByType(ACTION_TYPE.approveHRC20EthManger);

      await sleep(500);
    }

    if (approveEthManger.status !== STATUS.SUCCESS) {
      return;
    }

    const lockToken = getActionByType(ACTION_TYPE.burnHRC20Token);

    if (lockToken.status === STATUS.WAITING) {
      await ethMethods.burnToken(
        stores.userMetamask.erc20Address,
        transaction.oneAddress,
        transaction.amount,
        stores.userMetamask.erc20TokenDetails.decimals,
        hash => confirmCallback(hash, lockToken.type),
      );
    }

    return;
  } else {
    let getHRC20Action = getActionByType(ACTION_TYPE.getERC20Address);

    while (
      getHRC20Action &&
      [STATUS.IN_PROGRESS, STATUS.WAITING].includes(getHRC20Action.status)
    ) {
      await sleep(3000);
      getHRC20Action = getActionByType(ACTION_TYPE.getERC20Address);
    }

    if (!stores.user.hrc20Address) {
      await stores.userMetamask.setToken(transaction.erc20Address);
    }

    if (mode === EXCHANGE_MODE.ONE_TO_ETH) {
      const hrc20Address = stores.user.hrc20Address;

      let approveHmyManger = getActionByType(ACTION_TYPE.approveHRC20HmyManger);

      if (approveHmyManger && approveHmyManger.status === STATUS.WAITING) {
        await hmyMethods.approveHmyManger(
          hrc20Address,
          transaction.approveAmount,
          stores.userMetamask.erc20TokenDetails.decimals,
          hash => confirmCallback(hash, approveHmyManger.type),
        );
      }

      while (
        [STATUS.WAITING, STATUS.IN_PROGRESS].includes(approveHmyManger.status)
      ) {
        approveHmyManger = getActionByType(ACTION_TYPE.approveHRC20HmyManger);

        await sleep(500);
      }

      if (approveHmyManger.status !== STATUS.SUCCESS) {
        return;
      }

      const burnToken = getActionByType(ACTION_TYPE.lockHRC20Token);

      if (burnToken && burnToken.status === STATUS.WAITING) {
        await hmyMethods.lockToken(
          hrc20Address,
          transaction.ethAddress,
          transaction.amount,
          stores.userMetamask.erc20TokenDetails.decimals,
          hash => confirmCallback(hash, burnToken.type),
        );
      }

      return;
    }
  }
};

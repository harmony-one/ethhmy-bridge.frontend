import { ACTION_TYPE, EXCHANGE_MODE, IAction, STATUS } from '../interfaces';
import { sleep } from '../../utils';
import { ITransaction } from './index';
import { IStores } from '../index';
import { ethMethodsHRC20 } from '../../blockchain-bridge/eth';
import { hmyMethodsHRC20 } from '../../blockchain-bridge/hmy';

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

  const hmyMethods = stores.user.isMetamask
    ? hmyMethodsHRC20.hmyMethodsWeb3
    : hmyMethodsHRC20.hmyMethods;
  
  const ethMethods = ethMethodsHRC20;

  if (mode === EXCHANGE_MODE.ETH_TO_ONE) {
    let approveEthManger = getActionByType(ACTION_TYPE.approveHRC20EthManger);

    if (approveEthManger && approveEthManger.status === STATUS.WAITING) {
      const { amount } = transaction;

      ethMethods.approveEthManger(
        stores.userMetamask.erc20Address,
        amount,
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
          transaction.amount,
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

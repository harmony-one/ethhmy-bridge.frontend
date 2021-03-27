import {
  ACTION_TYPE,
  EXCHANGE_MODE,
  IAction,
  NETWORK_TYPE,
  STATUS,
} from '../interfaces';
import { sleep } from 'utils';
import { ITransaction } from './index';
import { IStores } from '../index';
import { hmyMethodsBEP20, hmyMethodsERC20 } from '../../blockchain-bridge/hmy';
import { getExNetworkMethods } from '../../blockchain-bridge/eth';

export const send1ETHToken = async (params: {
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

  let hmyMethodsBase;

  switch (stores.exchange.network) {
    case NETWORK_TYPE.BINANCE:
      hmyMethodsBase = hmyMethodsBEP20;
      break;
    case NETWORK_TYPE.ETHEREUM:
      hmyMethodsBase = hmyMethodsERC20;
      break;
    default:
      hmyMethodsBase = hmyMethodsERC20;
      break;
  }

  const hmyMethods = stores.user.isMetamask
    ? hmyMethodsBase.hmyMethodsWeb3
    : hmyMethodsBase.hmyMethods;

  const externalNetwork = getExNetworkMethods();

  const ethMethods = externalNetwork.ethMethodsBUSD;

  if (mode === EXCHANGE_MODE.ETH_TO_ONE) {
    const lockToken = getActionByType(ACTION_TYPE.lockToken);

    if (lockToken.status === STATUS.WAITING) {
      if (stores.exchange.network === NETWORK_TYPE.ETHEREUM) {
        await ethMethods.lockEth(
          transaction.oneAddress,
          transaction.amount,
          hash => confirmCallback(hash, lockToken.type),
        );
      } else {
        await externalNetwork.ethMethodsERC20.lockNative(
          transaction.oneAddress,
          transaction.amount,
          hash => confirmCallback(hash, lockToken.type),
        );
      }
    }

    return;
  }

  if (mode === EXCHANGE_MODE.ONE_TO_ETH) {
    const hrc20Address = stores.user.hrc20Address;

    let approveHmyManger = getActionByType(ACTION_TYPE.approveHmyManger);

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
      approveHmyManger = getActionByType(ACTION_TYPE.approveHmyManger);

      await sleep(500);
    }

    if (approveHmyManger.status !== STATUS.SUCCESS) {
      return;
    }

    const burnToken = getActionByType(ACTION_TYPE.burnToken);

    if (burnToken && burnToken.status === STATUS.WAITING) {
      await hmyMethods.burnToken(
        hrc20Address,
        transaction.ethAddress,
        transaction.amount,
        stores.userMetamask.erc20TokenDetails.decimals,
        hash => confirmCallback(hash, burnToken.type),
      );
    }

    return;
  }
};

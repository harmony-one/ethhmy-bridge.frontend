import { ACTION_TYPE, EXCHANGE_MODE, IAction, STATUS } from '../interfaces';
import { sleep } from 'utils';
import { ITransaction } from './index';
import { IStores } from '../index';
import { ethMethodsBUSD } from '../../blockchain-bridge/eth';
import { hmyMethodsERC20, hmyMethodsHRC20 } from '../../blockchain-bridge/hmy';

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

  const hmyMethods = stores.user.isMetamask
    ? hmyMethodsERC20.hmyMethodsWeb3
    : hmyMethodsERC20.hmyMethods;

  const ethMethods = ethMethodsBUSD;

  if (mode === EXCHANGE_MODE.ETH_TO_ONE) {
    const lockToken = getActionByType(ACTION_TYPE.lockToken);

    if (lockToken.status === STATUS.WAITING) {
      await ethMethods.lockEth(
        transaction.oneAddress,
        transaction.amount,
        hash => confirmCallback(hash, lockToken.type),
      );
    }

    return;
  }

  if (mode === EXCHANGE_MODE.ONE_TO_ETH) {
    const hrc20Address = stores.user.hrc20Address;

    let approveHmyManger = getActionByType(ACTION_TYPE.approveHmyManger);

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

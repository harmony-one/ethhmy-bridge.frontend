import { ACTION_TYPE, EXCHANGE_MODE, IAction, STATUS } from '../interfaces';
import { sleep } from 'utils';
import { ITransaction } from './index';
import { IStores } from '../index';
import { ethMethodsHRC20 } from '../../blockchain-bridge/eth';
import { hmyMethodsERC721, hmyMethodsHRC20 } from '../../blockchain-bridge/hmy';

export const send1ONEToken = async (params: {
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

  let getHRC20Action = getActionByType(ACTION_TYPE.getERC20Address);

  while (
    getHRC20Action &&
    [STATUS.IN_PROGRESS, STATUS.WAITING].includes(getHRC20Action.status)
  ) {
    await sleep(3000);
    getHRC20Action = getActionByType(ACTION_TYPE.getERC20Address);
  }

  if (!stores.userMetamask.erc20Address) {
    await stores.user.setHRC20Mapping(process.env.ONE_HRC20);
  }

  if (mode === EXCHANGE_MODE.ONE_TO_ETH) {
    const lockToken = getActionByType(ACTION_TYPE.lockHRC20Token);

    if (lockToken.status === STATUS.WAITING) {
      await hmyMethods.lockOne(
        transaction.ethAddress,
        transaction.amount,
        hash => confirmCallback(hash, lockToken.type),
      );
    }

    return;
  }

  if (mode === EXCHANGE_MODE.ETH_TO_ONE) {
    const erc20Address = stores.userMetamask.erc20Address;

    let approveHmyManger = getActionByType(ACTION_TYPE.approveHRC20EthManger);

    if (approveHmyManger && approveHmyManger.status === STATUS.WAITING) {
      await ethMethods.approveEthManger(
        erc20Address,
        transaction.amount,
        stores.userMetamask.erc20TokenDetails.decimals,
        hash => confirmCallback(hash, approveHmyManger.type),
      );
    }

    while (
      [STATUS.WAITING, STATUS.IN_PROGRESS].includes(approveHmyManger.status)
    ) {
      approveHmyManger = getActionByType(ACTION_TYPE.approveHRC20EthManger);

      await sleep(500);
    }

    if (approveHmyManger.status !== STATUS.SUCCESS) {
      return;
    }

    const burnToken = getActionByType(ACTION_TYPE.burnHRC20Token);

    if (burnToken && burnToken.status === STATUS.WAITING) {
      await ethMethods.burnToken(
        erc20Address,
        transaction.oneAddress,
        transaction.amount,
        stores.userMetamask.erc20TokenDetails.decimals,
        hash => confirmCallback(hash, burnToken.type),
      );
    }

    return;
  }
};

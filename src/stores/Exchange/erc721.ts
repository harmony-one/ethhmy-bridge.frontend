import { ACTION_TYPE, EXCHANGE_MODE, IAction, STATUS } from '../interfaces';
import { sleep } from '../../utils';
import { ITransaction } from './index';
import { IStores } from '../index';
import { ethMethodsERС721 } from '../../blockchain-bridge/eth';
import { hmyMethodsERC721, hmyMethodsHRC20 } from '../../blockchain-bridge/hmy';

export const sendErc721Token = async (params: {
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
    ? hmyMethodsERC721.hmyMethodsWeb3
    : hmyMethodsERC721.hmyMethods;

  const ethMethods = ethMethodsERС721;

  let getHRC20Action = getActionByType(ACTION_TYPE.getHRC20Address);

  while (
    getHRC20Action &&
    [STATUS.IN_PROGRESS, STATUS.WAITING].includes(getHRC20Action.status)
  ) {
    await sleep(3000);
    getHRC20Action = getActionByType(ACTION_TYPE.getHRC20Address);
  }

  if (!stores.user.hrc20Address) {
    await stores.userMetamask.setERC721Token(transaction.erc20Address);
  }

  if (mode === EXCHANGE_MODE.ETH_TO_ONE) {
    let approveEthManger = getActionByType(ACTION_TYPE.approveEthManger);

    if (approveEthManger && approveEthManger.status === STATUS.WAITING) {
      const { erc20Address } = transaction;

      ethMethods.setApprovalForAllEthManger(erc20Address, hash =>
        confirmCallback(hash, approveEthManger.type),
      );
    }

    while (
      [STATUS.WAITING, STATUS.IN_PROGRESS].includes(approveEthManger.status)
    ) {
      approveEthManger = getActionByType(ACTION_TYPE.approveEthManger);

      await sleep(500);
    }

    if (approveEthManger.status !== STATUS.SUCCESS) {
      return;
    }

    const lockToken = getActionByType(ACTION_TYPE.lockToken);

    if (lockToken.status === STATUS.WAITING) {
      await ethMethods.lockTokens(
        transaction.erc20Address,
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
      await hmyMethods.setApprovalForAll(hrc20Address, hash =>
        confirmCallback(hash, approveHmyManger.type),
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
      await hmyMethods.burnTokens(
        hrc20Address,
        transaction.ethAddress,
        transaction.amount,
        hash => confirmCallback(hash, burnToken.type),
      );
    }

    return;
  }
};

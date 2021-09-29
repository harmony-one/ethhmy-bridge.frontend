import { ACTION_TYPE, EXCHANGE_MODE, IAction, NETWORK_TYPE, STATUS } from '../interfaces';
import { ITransaction } from './index';
import { IStores } from '../index';
import { getExNetworkMethods, hmyMethodsHRC721 } from '../../blockchain-bridge';
import { sleep } from '../../utils';

export const sendHrc721Token = async (params: {
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
  const hmyMethodsBase = hmyMethodsHRC721;

  const hmyMethods = stores.user.isMetamask
    ? hmyMethodsBase.hmyMethodsWeb3
    : hmyMethodsBase.hmyMethods;

  const ethMethods = getExNetworkMethods().ethMethodsHRC721;

  if (mode === EXCHANGE_MODE.ETH_TO_ONE) {
    let approveEthManger = getActionByType(ACTION_TYPE.approveHRC721EthManger);
    const hrc721Address = transaction.hrc721Address;
    const mapperAddress = await ethMethods.getMappingFor(hrc721Address);
    if (approveEthManger && approveEthManger.status === STATUS.WAITING) {
      await ethMethods.approveEthManger(
        mapperAddress,
        hash => confirmCallback(hash, approveEthManger.type),
      );
    }

    while (
      [STATUS.WAITING, STATUS.IN_PROGRESS].includes(approveEthManger.status)
      ) {
      approveEthManger = getActionByType(ACTION_TYPE.approveHRC721EthManger);

      await sleep(500);
    }

    if (approveEthManger.status !== STATUS.SUCCESS) {
      return;
    }

    const lockToken = getActionByType(ACTION_TYPE.burnHRC721Token);

    if (lockToken.status === STATUS.WAITING) {
      await ethMethods.burnToken(
        mapperAddress,
        stores.user.address,
        transaction.amount,
        hash => confirmCallback(hash, lockToken.type),
      );
    }

    return;
  } else {
    let getHRC721Action = getActionByType(ACTION_TYPE.getHRC721Address);

    while (
      getHRC721Action &&
      [STATUS.IN_PROGRESS, STATUS.WAITING].includes(getHRC721Action.status)
      ) {
      await sleep(3000);
      getHRC721Action = getActionByType(ACTION_TYPE.getHRC721Address);
    }

    if (mode === EXCHANGE_MODE.ONE_TO_ETH) {
      const hrc721Address = transaction.hrc721Address;

      let approveHmyManger = getActionByType(ACTION_TYPE.approveHRC721HmyManger);

      if (approveHmyManger && approveHmyManger.status === STATUS.WAITING) {
        await hmyMethods.approveHmyManger(
          hrc721Address,
          hash => confirmCallback(hash, approveHmyManger.type),
        );
      }

      while (
        [STATUS.WAITING, STATUS.IN_PROGRESS].includes(approveHmyManger.status)
        ) {
        approveHmyManger = getActionByType(ACTION_TYPE.approveHRC721HmyManger);

        await sleep(500);
      }

      if (approveHmyManger.status !== STATUS.SUCCESS) {
        return;
      }

      const burnToken = getActionByType(ACTION_TYPE.lockHRC721Token);

      if (burnToken && burnToken.status === STATUS.WAITING) {
        await hmyMethods.lockTokens(
          hrc721Address,
          transaction.ethAddress,
          transaction.amount,
          hash => confirmCallback(hash, burnToken.type),
        );
      }

      return;
    }
  }
};

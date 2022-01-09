import { ACTION_TYPE, EXCHANGE_MODE, IAction, NETWORK_TYPE, STATUS } from '../interfaces';
import { ITransaction } from './index';
import { IStores } from '../index';
import {
  getExNetworkMethods,
  hmyMethodsBHRC1155,
  hmyMethodsHRC1155,
  hmyMethodsPHRC1155,
} from '../../blockchain-bridge';
import { sleep } from '../../utils';

export const sendHrc1155Token = async (params: {
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
    [NETWORK_TYPE.ETHEREUM]: hmyMethodsHRC1155,
    [NETWORK_TYPE.BINANCE]: hmyMethodsBHRC1155,
    [NETWORK_TYPE.POLYGON]: hmyMethodsPHRC1155,
  };

  const hmyMethodsBase = networkMap[stores.exchange.network];

  const hmyMethods = stores.user.isMetamask
    ? hmyMethodsBase.hmyMethodsWeb3
    : hmyMethodsBase.hmyMethods;

  const ethMethods = getExNetworkMethods().ethMethodsHRC1155;

  if (mode === EXCHANGE_MODE.ETH_TO_ONE) {
    let approveEthManger = getActionByType(ACTION_TYPE.approveHRC1155EthManger);
    const hrc1155Address = transaction.hrc1155Address;
    const mapperAddress = await ethMethods.getMappingFor(hrc1155Address);
    if (approveEthManger && approveEthManger.status === STATUS.WAITING) {
      await ethMethods.approveEthManger(
        mapperAddress,
        hash => confirmCallback(hash, approveEthManger.type),
      );
    }

    while (
      [STATUS.WAITING, STATUS.IN_PROGRESS].includes(approveEthManger.status)
      ) {
      approveEthManger = getActionByType(ACTION_TYPE.approveHRC1155EthManger);

      await sleep(500);
    }

    if (approveEthManger.status !== STATUS.SUCCESS) {
      return;
    }

    const lockToken = getActionByType(ACTION_TYPE.burnHRC1155Token);

    if (lockToken.status === STATUS.WAITING) {
      await ethMethods.burnToken(
        mapperAddress,
        stores.user.address,
        [transaction.hrc1155TokenId],
        [transaction.amount],
        hash => confirmCallback(hash, lockToken.type),
      );
    }

    return;
  } else {
    let getHRC1155Action = getActionByType(ACTION_TYPE.getHRC1155Address);

    while (
      getHRC1155Action &&
      [STATUS.IN_PROGRESS, STATUS.WAITING].includes(getHRC1155Action.status)
      ) {
      await sleep(3000);
      getHRC1155Action = getActionByType(ACTION_TYPE.getHRC1155Address);
    }

    if (mode === EXCHANGE_MODE.ONE_TO_ETH) {
      const hrc1155Address = transaction.hrc1155Address;

      let approveHmyManger = getActionByType(ACTION_TYPE.approveHRC1155HmyManger);

      if (approveHmyManger && approveHmyManger.status === STATUS.WAITING) {
        await hmyMethods.approveHmyManger(
          hrc1155Address,
          hash => confirmCallback(hash, approveHmyManger.type),
        );
      }

      while (
        [STATUS.WAITING, STATUS.IN_PROGRESS].includes(approveHmyManger.status)
        ) {
        approveHmyManger = getActionByType(ACTION_TYPE.approveHRC1155HmyManger);

        await sleep(500);
      }

      if (approveHmyManger.status !== STATUS.SUCCESS) {
        return;
      }

      const burnToken = getActionByType(ACTION_TYPE.lockHRC1155Token);

      if (burnToken && burnToken.status === STATUS.WAITING) {
        await hmyMethods.lockTokens(
          hrc1155Address,
          transaction.ethAddress,
          [transaction.hrc1155TokenId],
          [transaction.amount],
          hash => confirmCallback(hash, burnToken.type),
        );
      }

      return;
    }
  }
};

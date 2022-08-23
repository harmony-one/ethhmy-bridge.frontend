import { ACTION_TYPE, EXCHANGE_MODE, IAction, NETWORK_TYPE, STATUS } from '../interfaces';
import { sleep } from '../../utils';
import { ITransaction } from './index';
import { IStores } from '../index';
import { hmyMethodsERC1155, hmyMethodsS1HRC1155 } from '../../blockchain-bridge/hmy';
import { getExNetworkMethods } from '../../blockchain-bridge/eth';

export const sendErc1155Token = async (params: {
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
    [NETWORK_TYPE.ETHEREUM]: hmyMethodsERC1155,
    [NETWORK_TYPE.HARMONYSHARD1]: hmyMethodsS1HRC1155,
  }

  const hmyMethodsBase = networkMap[stores.exchange.network]

  const hmyMethods = stores.user.isMetamask
    ? hmyMethodsBase.hmyMethodsWeb3
    : hmyMethodsBase.hmyMethods;

  const ethMethods = getExNetworkMethods().ethMethodsERC1155;

  let getHRC20Action = getActionByType(ACTION_TYPE.getERC1155Address);

  while (
    getHRC20Action &&
    [STATUS.IN_PROGRESS, STATUS.WAITING].includes(getHRC20Action.status)
    ) {
    await sleep(3000);
    getHRC20Action = getActionByType(ACTION_TYPE.getERC1155Address);
  }

  if (!stores.user.hrc1155Address) {
    await stores.userMetamask.setERC1155Token(transaction.erc1155Address);
  }

  if (mode === EXCHANGE_MODE.ETH_TO_ONE) {
    let approveEthManger = getActionByType(ACTION_TYPE.approveERC1155EthManger);

    if (approveEthManger && approveEthManger.status === STATUS.WAITING) {
      const { erc1155Address } = transaction;

      await ethMethods.setApprovalForAllEthManger(erc1155Address, hash =>
        confirmCallback(hash, approveEthManger.type),
      );
    }

    while (
      [STATUS.WAITING, STATUS.IN_PROGRESS].includes(approveEthManger.status)
      ) {
      approveEthManger = getActionByType(ACTION_TYPE.approveERC1155EthManger);

      await sleep(500);
    }

    if (approveEthManger.status !== STATUS.SUCCESS) {
      return;
    }

    const lockToken = getActionByType(ACTION_TYPE.lockERC1155Token);

    if (lockToken.status === STATUS.WAITING) {
      await ethMethods.lockTokens(
        transaction.erc1155Address,
        transaction.oneAddress,
        [transaction.erc1155TokenId],
        [transaction.amount],
        hash => confirmCallback(hash, lockToken.type),
      );
    }

    return;
  }

  if (mode === EXCHANGE_MODE.ONE_TO_ETH) {
    const hrc1155Address = stores.user.hrc1155Address;

    let approveHmyManger = getActionByType(ACTION_TYPE.approveERC1155HmyManger);

    if (approveHmyManger && approveHmyManger.status === STATUS.WAITING) {
      await hmyMethods.setApprovalForAll(hrc1155Address, hash =>
        confirmCallback(hash, approveHmyManger.type),
      );
    }

    while (
      [STATUS.WAITING, STATUS.IN_PROGRESS].includes(approveHmyManger.status)
      ) {
      approveHmyManger = getActionByType(ACTION_TYPE.approveERC1155HmyManger);

      await sleep(500);
    }

    if (approveHmyManger.status !== STATUS.SUCCESS) {
      return;
    }

    const burnToken = getActionByType(ACTION_TYPE.burnERC1155Token);

    if (burnToken && burnToken.status === STATUS.WAITING) {
      await hmyMethods.burnTokens(
        hrc1155Address,
        transaction.ethAddress,
        [transaction.erc1155TokenId],
        [transaction.amount],
        hash => confirmCallback(hash, burnToken.type),
      );
    }

    return;
  }
};

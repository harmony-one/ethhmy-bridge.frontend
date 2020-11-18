import { StoreConstructor } from './core/StoreConstructor';
import { action, computed, observable } from 'mobx';
import { statusFetching } from '../constants';
import { ACTION_TYPE, EXCHANGE_MODE, IOperation, STATUS, TOKEN } from './interfaces';
import * as operationService from 'services';

import * as contract from '../blockchain-bridge';
import { sleep, uuid } from '../utils';
import { getNetworkFee } from '../blockchain-bridge/eth/helpers';

export enum EXCHANGE_STEPS {
  GET_TOKEN_ADDRESS = 'GET_TOKEN_ADDRESS',
  BASE = 'BASE',
  CONFIRMATION = 'CONFIRMATION',
  SENDING = 'SENDING',
  RESULT = 'RESULT',
}

export interface IStepConfig {
  id: EXCHANGE_STEPS;
  buttons: Array<{
    title: string;
    onClick: () => void;
    validate?: boolean;
    transparent?: boolean;
  }>;
  title?: string;
}

export class Exchange extends StoreConstructor {
  @observable error = '';
  @observable txHash = '';
  @observable actionStatus: statusFetching = 'init';
  @observable stepNumber = 0;
  @observable isFeeLoading = false;

  defaultTransaction = {
    scrtAddress: '',
    ethAddress: '',
    amount: '0',
    erc20Address: '',
  };

  @observable transaction = this.defaultTransaction;
  @observable mode: EXCHANGE_MODE = EXCHANGE_MODE.ETH_TO_SCRT;
  @observable token: TOKEN;

  constructor(stores) {
    super(stores);

    setInterval(async () => {
      if (this.operation) {
        const operation = await operationService.getOperation(
          this.operation.id,
        );

        if (this.operation && this.operation.id === operation.id) {
          this.operation = operation;
          this.setStatus();
        }
      }
    }, 3000);
  }

  @computed
  get step() {
    return this.stepsConfig[this.stepNumber];
  }

  @observable ethNetworkFee = 0;

  @computed
  get networkFee() {
    return this.mode === EXCHANGE_MODE.ETH_TO_SCRT
      ? this.ethNetworkFee
      : 0.0134438;
  }

  stepsConfig: Array<IStepConfig> = [
    {
      id: EXCHANGE_STEPS.BASE,
      buttons: [
        {
          title: 'Continue',
          onClick: async () => {
            this.stepNumber = this.stepNumber + 1;
            // this.transaction.oneAddress = this.stores.user.address;
            this.transaction.erc20Address = this.stores.userMetamask.erc20Address;

            switch (this.mode) {
              case EXCHANGE_MODE.ETH_TO_SCRT:
                this.transaction.ethAddress = this.stores.userMetamask.ethAddress;

                this.isFeeLoading = true;
                this.ethNetworkFee = await getNetworkFee();
                this.isFeeLoading = false;
                break;
              case EXCHANGE_MODE.SCRT_TO_ETH:
                this.transaction.scrtAddress = this.stores.user.address;
                break;
            }
          },
          validate: true,
        },
      ],
    },
    {
      id: EXCHANGE_STEPS.CONFIRMATION,
      buttons: [
        {
          title: 'Back',
          onClick: () => (this.stepNumber = this.stepNumber - 1),
          transparent: true,
        },
        {
          title: 'Confirm',
          onClick: () => {
            this.stepNumber = this.stepNumber + 1;
            this.sendOperation();
          },
        },
      ],
    },
    {
      id: EXCHANGE_STEPS.SENDING,
      buttons: [],
    },
    {
      id: EXCHANGE_STEPS.RESULT,
      buttons: [
        {
          title: 'Close',
          transparent: true,
          onClick: () => {
            this.clear();
            this.stepNumber = 0;
          },
        },
      ],
    },
  ];

  @action.bound
  setAddressByMode() {
    if (this.mode === EXCHANGE_MODE.ETH_TO_SCRT) {
      // this.transaction.oneAddress = this.stores.user.address;
      this.transaction.scrtAddress = '';
      this.transaction.ethAddress = this.stores.userMetamask.ethAddress;
    }

    if (this.mode === EXCHANGE_MODE.SCRT_TO_ETH) {
      // this.transaction.ethAddress = this.stores.userMetamask.ethAddress;
      this.transaction.ethAddress = '';
      this.transaction.scrtAddress = this.stores.user.address;
    }
  }

  @action.bound
  setMode(mode: EXCHANGE_MODE) {
    if (
      this.operation &&
      [4, 5].includes(this.operation.status)
    ) {
      return;
    }

    this.clear();
    this.mode = mode;
    this.setAddressByMode();
  }

  @action.bound
  setToken(token: TOKEN) {
    // this.clear();
    this.token = token;
    // this.setAddressByMode();
  }

  @observable operation: IOperation;

  @action.bound
  setStatus() {
    switch (this.operation.status) {
      case 5:
        this.actionStatus = 'error';
        this.stepNumber = this.stepsConfig.length - 1;
        break;

      case 4:
        this.actionStatus = 'success';
        this.stepNumber = this.stepsConfig.length - 1;
        break;

      default:
        this.stepNumber = 2;
        this.actionStatus = 'fetching';
        break;
    }
  }

  @action.bound
  async setOperationId(operationId: string) {
    this.operation = await operationService.getOperation(operationId);

    this.mode = this.operation.type;
    this.token = this.operation.token;
    this.transaction.amount = String(this.operation.amount);
    this.transaction.ethAddress = this.operation.ethAddress;
    this.transaction.scrtAddress = this.operation.oneAddress;
    this.transaction.erc20Address = this.operation.erc20Address;

    this.setStatus();
  }

  @action.bound
  async createOperation(transactionHash) {

    const token = this.token === TOKEN.ETH ? 'native' : this.transaction.erc20Address;

    const operation = await operationService.createOperation({
      //tx: this.transaction,
      transactionHash,
      //mode: this.mode,
      //token,
      id: uuid(),
    });
    this.operation = operation.operation;
    return this.operation;
  }

  async getStatus(id) {
    return await operationService.getStatus({
      id
    });
  }

  getActionByType = (type: ACTION_TYPE) =>
    this.operation.actions.find(a => a.type === type);

  @action.bound
  async sendOperation(id: string = '') {
    try {
      this.actionStatus = 'fetching';

      let operationId = id;

      // if (!operationId) {
      //   operationId = await this.createOperation();
      //
      //
      // }

      //await this.setOperationId(operationId);
      //
      // if (
      //   this.operation.status === STATUS.SUCCESS ||
      //   this.operation.status === STATUS.ERROR
      // ) {
      //   return;
      // }
      // this.operation.status = STATUS.SUCCESS
      const confirmCallback = async (
        transactionHash,
        actionType: ACTION_TYPE,
      ) => {
        // this.operation = await operationService.confirmAction({
        //   operationId,
        //   transactionHash,
        //   actionType,
        // });
      };

      let ethMethods, hmyMethods;

      // if (!this.stores.user.address || !this.stores.userMetamask.ethAddress) {
      //   await sleep(3000);
      // }
      //
      // if (this.operation.oneAddress !== this.stores.user.address) {
      //   return;
      // }
      //
      // if (this.operation.ethAddress !== this.stores.userMetamask.ethAddress) {
      //   return;
      // }
      const createOperation = async (
        transactionHash,
      ) => {
        await this.createOperation(transactionHash);
        this.stores.routing.push(
          this.token + '/operations/' + this.operation.id,
        );
      };

      switch (this.token) {
        case TOKEN.ETH:
          ethMethods = contract.ethMethodsETH;
          hmyMethods = contract.hmyMethodsBUSD;
          break;

        case TOKEN.ERC20:
          ethMethods = contract.ethMethodsERC20;
          hmyMethods = contract.hmyMethodsERC20;
          break;
      }

      if (this.token === TOKEN.ERC20) {
        let getHRC20Action = this.getActionByType(ACTION_TYPE.getHRC20Address);

        while (
          getHRC20Action &&
          [STATUS.IN_PROGRESS, STATUS.WAITING].includes(getHRC20Action.status)
        ) {
          await sleep(3000);
          getHRC20Action = this.getActionByType(ACTION_TYPE.getHRC20Address);
        }

        if (!this.stores.user.hrc20Address) {
          await this.stores.userMetamask.setToken(
            this.transaction.erc20Address,
          );
        }

        if (this.mode === EXCHANGE_MODE.ETH_TO_SCRT) {
          let approveEthManger = this.getActionByType(
            ACTION_TYPE.approveEthManger,
          );

          if (approveEthManger && approveEthManger.status === STATUS.WAITING) {
            const { amount, erc20Address } = this.transaction;

            ethMethods.approveEthManger(
              erc20Address,
              amount,
              this.stores.userMetamask.erc20TokenDetails.decimals,
              hash => confirmCallback(hash, approveEthManger.type),
            );
          }

          while (
            [STATUS.WAITING, STATUS.IN_PROGRESS].includes(
              approveEthManger.status,
            )
          ) {
            approveEthManger = this.getActionByType(
              ACTION_TYPE.approveEthManger,
            );

            await sleep(500);
          }

          if (approveEthManger.status !== STATUS.SUCCESS) {
            return;
          }

          const lockToken = this.getActionByType(ACTION_TYPE.lockToken);

          if (lockToken.status === STATUS.WAITING) {
            await ethMethods.lockToken(
              this.transaction.erc20Address,
              this.transaction.scrtAddress,
              this.transaction.amount,
              this.stores.userMetamask.erc20TokenDetails.decimals,
              hash => createOperation(hash),
            );
          }

          return;
        }

        if (this.mode === EXCHANGE_MODE.SCRT_TO_ETH) {
          const hrc20Address = this.stores.user.hrc20Address;

          let approveHmyManger = this.getActionByType(
            ACTION_TYPE.approveHmyManger,
          );

          if (approveHmyManger && approveHmyManger.status === STATUS.WAITING) {
            await hmyMethods.approveHmyManger(
              hrc20Address,
              this.transaction.amount,
              this.stores.userMetamask.erc20TokenDetails.decimals,
              hash => confirmCallback(hash, approveHmyManger.type),
            );
          }

          while (
            [STATUS.WAITING, STATUS.IN_PROGRESS].includes(
              approveHmyManger.status,
            )
          ) {
            approveHmyManger = this.getActionByType(
              ACTION_TYPE.approveHmyManger,
            );

            await sleep(500);
          }

          if (approveHmyManger.status !== STATUS.SUCCESS) {
            return;
          }

          const burnToken = this.getActionByType(ACTION_TYPE.burnToken);

          if (burnToken && burnToken.status === STATUS.WAITING) {
            await hmyMethods.burnToken(
              hrc20Address,
              this.transaction.ethAddress,
              this.transaction.amount,
              this.stores.userMetamask.erc20TokenDetails.decimals,
              hash => confirmCallback(hash, burnToken.type),
            );
          }

          return;
        }
      } else {
        if (this.mode === EXCHANGE_MODE.ETH_TO_SCRT) {
          // ***ETH to Secret-Eth***


          // let approveEthManger = this.getActionByType(
          //   ACTION_TYPE.approveEthManger,
          // );

          // if (approveEthManger && approveEthManger.status === STATUS.WAITING) {
          //
          // }
          // ethMethods.approveEthManger(this.transaction.amount, hash =>
          //   {},
          // );
          // while (
          //   [STATUS.WAITING, STATUS.IN_PROGRESS].includes(
          //     approveEthManger.status,
          //   )
          // ) {
          //   approveEthManger = this.getActionByType(
          //     ACTION_TYPE.approveEthManger,
          //   );

            //await sleep(5000);
          //}
          //
          // if (approveEthManger.status !== STATUS.SUCCESS) {
          //   return;
          // }

          // const lockToken = this.getActionByType(ACTION_TYPE.lockToken);
          //
          // if (lockToken && lockToken.status === STATUS.WAITING) {
          //
          // }
          let transaction = await ethMethods.swapEth (
            this.transaction.scrtAddress,
            this.transaction.amount,
          );

          await createOperation(transaction.transactionHash)

          //operationId = await this.createOperation(transactionHash);
          this.operation.status = 2

          while (![4, 5].includes(this.operation.status)) {
            await sleep(2000);
            const lolStatus = await this.getStatus(this.operation.id)
            console.log(lolStatus)
            if (lolStatus === 4) {
              this.operation.status = lolStatus;
            } else if (lolStatus === 5) {
              this.operation.status = lolStatus;
            }
          }
          this.setStatus()
          return;
        }

        if (this.mode === EXCHANGE_MODE.SCRT_TO_ETH) {
          let approveHmyManger = this.getActionByType(
            ACTION_TYPE.approveHmyManger,
          );

          if (approveHmyManger && approveHmyManger.status === STATUS.WAITING) {
            await hmyMethods.approveHmyManger(this.transaction.amount, hash =>
              confirmCallback(hash, approveHmyManger.type),
            );
          }

          while (
            [STATUS.WAITING, STATUS.IN_PROGRESS].includes(
              approveHmyManger.status,
            )
          ) {
            approveHmyManger = this.getActionByType(
              ACTION_TYPE.approveHmyManger,
            );

            await sleep(500);
          }

          if (approveHmyManger.status !== STATUS.SUCCESS) {
            return;
          }

          const burnToken = this.getActionByType(ACTION_TYPE.burnToken);

          if (burnToken && burnToken.status === STATUS.WAITING) {
            await hmyMethods.burnToken(
              this.transaction.ethAddress,
              this.transaction.amount,
              hash => createOperation(hash),
            );
          }

          return;
        }
      }

      return;
    } catch (e) {
      if (e.status && e.response.body) {
        this.error = e.response.body.message;
      } else {
        this.error = e.message;
      }
      this.actionStatus = 'error';
      this.operation = null;
    }

    this.stepNumber = this.stepsConfig.length - 1;
  }

  clear() {
    this.transaction = this.defaultTransaction;
    this.operation = null;
    this.error = '';
    this.txHash = '';
    this.actionStatus = 'init';
    this.stepNumber = 0;
    this.stores.routing.push(`/${this.token}`);
  }
}

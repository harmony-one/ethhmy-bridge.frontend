import { StoreConstructor } from './core/StoreConstructor';
import { action, computed, observable } from 'mobx';
import { statusFetching } from '../constants';
import {
  ACTION_TYPE,
  EXCHANGE_MODE,
  IOperation,
  STATUS,
  TOKEN,
} from './interfaces';
import * as operationService from 'services';

import { ethMethods, hmyMethods } from '../blockchain-bridge';
import { sleep } from '../utils';

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

  defaultTransaction = {
    oneAddress: '',
    ethAddress: '',
    amount: '0',
    erc20Address: '',
  };

  @observable transaction = this.defaultTransaction;
  @observable mode: EXCHANGE_MODE = EXCHANGE_MODE.ETH_TO_ONE;
  @observable token: TOKEN;

  constructor(stores) {
    super(stores);

    setInterval(async () => {
      if (this.operation) {
        this.operation = await operationService.getOperation(this.operation.id);
        this.setStatus();
      }
    }, 3000);
  }

  @computed
  get step() {
    return this.stepsConfig[this.stepNumber];
  }

  @computed
  get networkFee() {
    return this.mode === EXCHANGE_MODE.ETH_TO_ONE ? 0.000845586 : 0.0134438;
  }

  stepsConfig: Array<IStepConfig> = [
    {
      id: EXCHANGE_STEPS.BASE,
      buttons: [
        {
          title: 'Continue',
          onClick: () => {
            this.stepNumber = this.stepNumber + 1;
            // this.transaction.oneAddress = this.stores.user.address;
            this.transaction.erc20Address = this.stores.userMetamask.erc20Address;

            switch (this.mode) {
              case EXCHANGE_MODE.ETH_TO_ONE:
                this.transaction.ethAddress = this.stores.userMetamask.ethAddress;
                break;
              case EXCHANGE_MODE.ONE_TO_ETH:
                this.transaction.oneAddress = this.stores.user.address;
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
    if (this.mode === EXCHANGE_MODE.ETH_TO_ONE) {
      // this.transaction.oneAddress = this.stores.user.address;
      this.transaction.oneAddress = '';
      this.transaction.ethAddress = this.stores.userMetamask.ethAddress;
    }

    if (this.mode === EXCHANGE_MODE.ONE_TO_ETH) {
      // this.transaction.ethAddress = this.stores.userMetamask.ethAddress;
      this.transaction.ethAddress = '';
      this.transaction.oneAddress = this.stores.user.address;
    }
  }

  @action.bound
  setMode(mode: EXCHANGE_MODE) {
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
      case STATUS.ERROR:
        this.actionStatus = 'error';
        this.stepNumber = this.stepsConfig.length - 1;
        break;

      case STATUS.SUCCESS:
        this.actionStatus = 'success';
        this.stepNumber = this.stepsConfig.length - 1;
        break;

      case STATUS.WAITING:
      case STATUS.IN_PROGRESS:
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
    this.transaction.oneAddress = this.operation.oneAddress;

    this.setStatus();
  }

  @action.bound
  async createOperation() {
    this.operation = await operationService.createOperation({
      ...this.transaction,
      type: this.mode,
    });

    return this.operation.id;
  }

  getActionByType = (type: ACTION_TYPE) =>
    this.operation.actions.find(a => a.type === type);

  @action.bound
  async sendOperation(id: string = '') {
    try {
      this.actionStatus = 'fetching';

      let operationId = id;

      if (!operationId) {
        operationId = await this.createOperation();

        this.stores.routing.push(
          this.token + '/operations/' + this.operation.id,
        );
      }

      await this.setOperationId(operationId);

      if (
        this.operation.status === STATUS.SUCCESS ||
        this.operation.status === STATUS.ERROR
      ) {
        return;
      }

      const confirmCallback = async (transactionHash, actionId) => {
        this.operation = await operationService.confirmAction({
          operationId,
          transactionHash,
          actionId,
        });
      };

      // actions pool

      let getHRC20Action = this.getActionByType(ACTION_TYPE.getHRC20Address);

      while (
        getHRC20Action &&
        [STATUS.IN_PROGRESS, STATUS.WAITING].includes(getHRC20Action.status)
      ) {
        await sleep(3000);
        getHRC20Action = this.getActionByType(ACTION_TYPE.getHRC20Address);
      }

      if (this.mode === EXCHANGE_MODE.ETH_TO_ONE) {
        const approveEthManger = this.getActionByType(
          ACTION_TYPE.approveEthManger,
        );

        if (approveEthManger && approveEthManger.status === STATUS.WAITING) {
          const { amount, erc20Address } = this.transaction;

          await ethMethods.approveEthManger(erc20Address, amount, hash =>
            confirmCallback(hash, approveEthManger.id),
          );
        }

        const lockToken = this.getActionByType(ACTION_TYPE.lockToken);

        if (lockToken.status === STATUS.WAITING) {
          await ethMethods.lockToken(
            this.transaction.erc20Address,
            this.transaction.oneAddress,
            this.transaction.amount,
            hash => confirmCallback(hash, lockToken.id),
          );
        }
      }

      if (this.mode === EXCHANGE_MODE.ONE_TO_ETH) {
        const hrc20Address = this.stores.user.hrc20Address;

        const approveHmyManger = this.getActionByType(
          ACTION_TYPE.approveHmyManger,
        );

        if (approveHmyManger.status === STATUS.WAITING) {
          await hmyMethods.approveHmyManger(
            hrc20Address,
            this.transaction.amount,
            hash => confirmCallback(hash, approveHmyManger.id),
          );
        }

        const burnToken = this.getActionByType(ACTION_TYPE.burnToken);

        if (burnToken.status === STATUS.WAITING) {
          await hmyMethods.burnToken(
            hrc20Address,
            this.transaction.ethAddress,
            this.transaction.amount,
            hash => confirmCallback(hash, burnToken.id),
          );
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

import { StoreConstructor } from './core/StoreConstructor';
import { action, computed, observable } from 'mobx';
import { statusFetching } from '../constants';
import { IOperation, OPERATION_TYPE, STATUS, TOKEN } from './interfaces';
import * as operationService from 'services';

import {
  ethMethodsBUSD,
  hmyMethodsBUSD,
  ethMethodsLINK,
  hmyMethodsLINK,
} from '../blockchain-bridge';

export enum EXCHANGE_MODE {
  ETH_TO_ONE = 'ETH_TO_ONE',
  ONE_TO_ETH = 'ONE_TO_ETH',
}

export enum EXCHANGE_STEPS {
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

  stepsConfig: Array<IStepConfig> = [
    {
      id: EXCHANGE_STEPS.BASE,
      buttons: [
        {
          title: 'Continue',
          onClick: () => {
            this.stepNumber = this.stepNumber + 1;
            // this.transaction.oneAddress = this.stores.user.address;
            switch (this.mode) {
              case EXCHANGE_MODE.ETH_TO_ONE:
                this.transaction.ethAddress = this.stores.userMetamask.ethAddress;
              case EXCHANGE_MODE.ONE_TO_ETH:
                this.transaction.oneAddress = this.stores.user.address;
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
      this.transaction.oneAddress = this.stores.user.address;
      this.transaction.ethAddress = this.stores.userMetamask.ethAddress;
    }

    if (this.mode === EXCHANGE_MODE.ONE_TO_ETH) {
      this.transaction.ethAddress = this.stores.userMetamask.ethAddress;
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
    this.setAddressByMode();
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

    switch (this.operation.type) {
      case OPERATION_TYPE.BUSD_ETH_ONE:
        this.mode = EXCHANGE_MODE.ETH_TO_ONE;
        this.token = TOKEN.BUSD;
        break;

      case OPERATION_TYPE.BUSD_ONE_ETH:
        this.mode = EXCHANGE_MODE.ONE_TO_ETH;
        this.token = TOKEN.BUSD;
        break;

      case OPERATION_TYPE.LINK_ETH_ONE:
        this.mode = EXCHANGE_MODE.ETH_TO_ONE;
        this.token = TOKEN.LINK;
        break;

      case OPERATION_TYPE.LINK_ONE_ETH:
        this.mode = EXCHANGE_MODE.ONE_TO_ETH;
        this.token = TOKEN.LINK;
        break;
    }

    this.transaction.amount = String(this.operation.amount);
    this.transaction.ethAddress = this.operation.ethAddress;
    this.transaction.oneAddress = this.operation.oneAddress;

    this.setStatus();
  }

  @action.bound
  async createOperation() {
    let operationType: OPERATION_TYPE;

    if (this.mode === EXCHANGE_MODE.ONE_TO_ETH) {
      if (this.token === TOKEN.BUSD) {
        operationType = OPERATION_TYPE.BUSD_ONE_ETH;
      }
      if (this.token === TOKEN.LINK) {
        operationType = OPERATION_TYPE.LINK_ONE_ETH;
      }
    }

    if (this.mode === EXCHANGE_MODE.ETH_TO_ONE) {
      if (this.token === TOKEN.BUSD) {
        operationType = OPERATION_TYPE.BUSD_ETH_ONE;
      }
      if (this.token === TOKEN.LINK) {
        operationType = OPERATION_TYPE.LINK_ETH_ONE;
      }
    }

    this.operation = await operationService.createOperation(
      this.transaction,
      operationType,
    );

    return this.operation.id;
  }

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

      let ethMethods, hmyMethods;

      if (this.token === TOKEN.BUSD) {
        ethMethods = ethMethodsBUSD;
        hmyMethods = hmyMethodsBUSD;
      }

      if (this.token === TOKEN.LINK) {
        ethMethods = ethMethodsLINK;
        hmyMethods = hmyMethodsLINK;
      }

      if (this.mode === EXCHANGE_MODE.ETH_TO_ONE) {
        const approveEthManger = this.operation.actions[0];

        if (approveEthManger.status === STATUS.WAITING) {
          await ethMethods.approveEthManger(this.transaction.amount, hash =>
            confirmCallback(hash, approveEthManger.id),
          );
        }

        const lockToken = this.operation.actions[1];

        if (lockToken.status === STATUS.WAITING) {
          await ethMethods.lockToken(
            this.transaction.oneAddress,
            this.transaction.amount,
            hash => confirmCallback(hash, lockToken.id),
          );
        }
      }

      if (this.mode === EXCHANGE_MODE.ONE_TO_ETH) {
        const approveHmyManger = this.operation.actions[0];

        if (approveHmyManger.status === STATUS.WAITING) {
          await hmyMethods.approveHmyManger(this.transaction.amount, hash =>
            confirmCallback(hash, approveHmyManger.id),
          );
        }

        const burnToken = this.operation.actions[1];

        if (burnToken.status === STATUS.WAITING) {
          await hmyMethods.burnToken(
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

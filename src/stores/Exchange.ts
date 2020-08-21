import { StoreConstructor } from './core/StoreConstructor';
import { action, computed, observable } from 'mobx';
import * as blockchain from '../blockchain-bridge';
import { statusFetching } from '../constants';

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

enum ACTIONS_TYPE {
  ETH_TO_ONE_BUSD = 'ETH_TO_ONE_BUSD',
  ONE_TO_ETH_BUSD = 'ONE_TO_ETH_BUSD',
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

const hmyAddr = '0x203fc3cA24D4194A4CD1614Fec186a7951Bb0244';
const ethAddr = '0x0FBb9C31eabc2EdDbCF59c03E76ada36f5AB8723';

export class Exchange extends StoreConstructor {
  @observable mode: EXCHANGE_MODE = EXCHANGE_MODE.ETH_TO_ONE;
  @observable error = '';
  @observable txHash = '';
  @observable actionStatus: statusFetching = 'init';
  @observable stepNumber = 0;

  @computed
  get step() {
    return this.stepsConfig[this.stepNumber];
  }

  constructor(stores) {
    super(stores);
  }

  @observable currentAction: ACTIONS_TYPE = ACTIONS_TYPE.ETH_TO_ONE_BUSD;
  @observable currentActionStep = 0;

  @action.bound
  setCurrentActionStep(step: number, value?: string) {
    this.currentActionStep = step;

    if (value) {
      this.actionSteps[this.currentAction][step] = value;
    }
  }

  @observable actionSteps: Record<ACTIONS_TYPE, any[]> = {
    ETH_TO_ONE_BUSD: [
      'User approve Eth manager to lock tokens',
      'Wait sufficient to confirm the transaction went through',
      `Wait while 13 blocks will be confirmed`,
      'Mint One Tokens',
    ],
    ONE_TO_ETH_BUSD: [
      'User needs to approve Harmony manager to burn token',
      'Harmony burn tokens, transaction is confirmed instantaneously',
      'Eth manager unlock tokens',
    ],
  };

  defaultTransaction = {
    oneAddress: '',
    ethAddress: '',
    amount: '0',
  };

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
            this.sendEthToOne();
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

  @observable transaction = this.defaultTransaction;

  @action.bound
  setMode(mode: EXCHANGE_MODE) {
    this.clear();
    this.mode = mode;

    if (this.mode === EXCHANGE_MODE.ETH_TO_ONE) {
      this.currentAction = ACTIONS_TYPE.ETH_TO_ONE_BUSD;
      this.transaction.oneAddress = this.stores.user.address;
    }

    if (this.mode === EXCHANGE_MODE.ONE_TO_ETH) {
      this.currentAction = ACTIONS_TYPE.ONE_TO_ETH_BUSD;
      this.transaction.ethAddress = this.stores.userMetamask.ethAddress;
    }
  }

  @action.bound
  sendETHtoAddress() {
    return Promise.resolve(true);
  }

  @action.bound
  async sendONEtoAddress() {
    this.actionStatus = 'fetching';

    this.txHash =
      '0xfaab89bb4385c464e6869c0132bdbc1f32181e621e699ef0b91f7b41bfa21129';

    return;

    const res = await blockchain.sendTx(
      this.transaction.amount,
      this.stores.user.address,
      this.transaction.ethAddress,
    );

    this.txHash = res.txhash;

    if (res.error) {
      this.error = res.message;
      this.actionStatus = 'error';
    } else {
      this.actionStatus = 'success';
    }

    this.stepNumber = this.stepsConfig.length - 1;
  }

  @action.bound
  async get_BUSD_Balances() {
    let hmyBUSD = await blockchain.getHmyBalanceBUSD(hmyAddr);
    let ethBUSD = await blockchain.getEthBalanceBUSD(ethAddr);

    console.log('hmy balance: ', hmyBUSD.toString());
    console.log('eth balance: ', ethBUSD);
  }

  @action.bound
  async sendEthToOne() {
    try {
      this.actionStatus = 'fetching';

      if (this.mode === EXCHANGE_MODE.ETH_TO_ONE) {
        await blockchain.ethToOneBUSD({
          amount: this.transaction.amount,
          hmyUserAddress: this.transaction.oneAddress,
          ethUserAddress: this.transaction.ethAddress,
          setActionStep: this.setCurrentActionStep,
        });
      }

      if (this.mode === EXCHANGE_MODE.ONE_TO_ETH) {
        await blockchain.oneToEthBUSD({
          amount: this.transaction.amount,
          hmyUserAddress: this.transaction.oneAddress,
          ethUserAddress: this.transaction.ethAddress,
          setActionStep: this.setCurrentActionStep,
        });
      }

      this.actionStatus = 'success';
    } catch (e) {
      this.error = e.message;
      this.actionStatus = 'error';
    }

    this.stepNumber = this.stepsConfig.length - 1;
  }

  clear() {
    this.transaction = this.defaultTransaction;
    this.error = '';
    this.txHash = '';
    this.actionStatus = 'init';
    this.stepNumber = 0;
  }
}

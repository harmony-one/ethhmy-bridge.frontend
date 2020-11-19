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

import * as contract from '../blockchain-bridge';
import { mulDecimals, sleep, uuid } from '../utils';
import { getNetworkFee } from '../blockchain-bridge/eth/helpers';
import { tokens } from '../pages/Exchange/tokens';

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

export const FormatWithoutDecimals = (
  type: TOKEN,
  amount: string,
  address: string,
) => {
  if (type === TOKEN.ERC20 || type === TOKEN.S20) {
    const token = tokens.find(t =>
      [t.snip20address.toLowerCase(), t.address.toLocaleLowerCase()].includes(
        address.toLowerCase(),
      ),
    );

    if (token) {
      return mulDecimals(amount, token.decimals).toString();
    }
  } else if (type === TOKEN.ETH) {
    return mulDecimals(amount, 18).toString();
  }

  return amount;
};

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
    snip20Address: '',
  };

  defaultOperation: IOperation = {
    actions: undefined,
    amount: 0,
    ethAddress: '',
    fee: 0,
    id: '',
    oneAddress: '',
    status: 7,
    timestamp: 0,
    token: undefined,
    type: undefined,
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
            this.transaction.snip20Address = this.stores.user.snip20Address;

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
    if (this.operation && [4, 5].includes(this.operation.status)) {
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
    const token =
      this.token === TOKEN.ETH ? 'native' : this.transaction.erc20Address;

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
      id,
    });
  }

  getActionByType = (type: ACTION_TYPE) =>
    this.operation.actions.find(a => a.type === type);

  @action.bound
  async sendOperation(id: string = '') {
    try {
      this.actionStatus = 'fetching';

      this.transaction.erc20Address = this.transaction.erc20Address.trim();
      this.transaction.scrtAddress = this.transaction.scrtAddress.trim();
      this.transaction.ethAddress = this.transaction.ethAddress.trim();

      if (this.mode === EXCHANGE_MODE.SCRT_TO_ETH) {
        await this.swapSnip20ToEth();
      } else if (this.mode === EXCHANGE_MODE.ETH_TO_SCRT) {
        if (this.token === TOKEN.ERC20) {
          await this.swapErc20ToScrt();
        } else {
          await this.swapEthToScrt();
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

  async waitForResult() {
    while (![4, 5].includes(this.operation.status)) {
      await sleep(2000);
      const lolStatus = await this.getStatus(this.operation.id);
      console.log(lolStatus);
      if (lolStatus === 4) {
        this.operation.status = lolStatus;
      } else if (lolStatus === 5) {
        this.operation.status = lolStatus;
      }
    }
  }

  async swapErc20ToScrt() {
    this.operation = this.defaultOperation;
    this.operation.status = 8;
    this.setStatus();

    await contract.ethMethodsERC20.callApprove(
      this.transaction.erc20Address,
      this.transaction.amount,
      this.stores.userMetamask.erc20TokenDetails.decimals,
    );

    this.operation.status = 7;
    this.setStatus();

    const transaction = await contract.ethMethodsERC20.swapToken(
      this.transaction.erc20Address,
      this.transaction.scrtAddress,
      this.transaction.amount,
      this.stores.userMetamask.erc20TokenDetails.decimals,
    );

    this.txHash = transaction.transactionHash;
    await this.createOperation(transaction.transactionHash);
    this.stores.routing.push(this.token + '/operations/' + this.operation.id);

    // //operationId = await this.createOperation(transactionHash);
    // this.operation.status
    await this.waitForResult();

    this.setStatus();
    return;
  }

  async swapEthToScrt() {
    this.operation = this.defaultOperation;
    this.setStatus();

    let transaction = await contract.ethMethodsETH.swapEth(
      this.transaction.scrtAddress,
      this.transaction.amount,
    );

    this.txHash = transaction.transactionHash;
    await this.createOperation(transaction.transactionHash);
    this.stores.routing.push(this.token + '/operations/' + this.operation.id);

    // //operationId = await this.createOperation(transactionHash);
    // this.operation.status
    await this.waitForResult();

    this.setStatus();
    return;
  }

  async swapSnip20ToEth() {
    this.operation = this.defaultOperation;
    this.setStatus();

    /* 
    # Generate swap tx on secret network
    swap = {"send": {"amount": str(TRANSFER_AMOUNT_ERC),
                     "msg": base64.b64encode(ethr_leader.signer.address.encode()).decode(),
                     "recipient": swap_contract_addr}}
    tx_hash = run(f"secretcli tx compute execute {secret_token_addr} "
                  f"'{json.dumps(swap)}' --from t1 -b block -y --gas 300000", shell=True, stdout=PIPE, stderr=PIPE)
    */

    const msg = {
      send: {
        amount: FormatWithoutDecimals(
          TOKEN.S20,
          this.transaction.amount,
          this.transaction.snip20Address,
        ),
        msg: btoa(this.transaction.ethAddress),
        recipient:
          'secret1u8mgmspdeakpf7u8leq68d5xtkykskwrytevyn' /* Swap contract */,
      },
    };

    const response = await this.stores.user.cosmJS.execute(
      this.transaction.snip20Address,
      msg,
    );

    console.log(response);

    //    // this.txHash = transaction.transactionHash
    //     // //operationId = await this.createOperation(transactionHash);
    //         this.stores.routing.push(
    //       this.token + '/operations/' + this.operation.id,
    //     );
    //     // await this.waitForResult();

    this.setStatus();
    return;
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

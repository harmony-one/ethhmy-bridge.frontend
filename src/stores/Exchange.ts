import { StoreConstructor } from './core/StoreConstructor';
import { action, computed, observable } from 'mobx';
import { statusFetching, SwapStatus } from '../constants';
import { ACTION_TYPE, EXCHANGE_MODE, IOperation, ITokenInfo, TOKEN } from './interfaces';
import * as operationService from 'services';

import * as contract from '../blockchain-bridge';
import { balanceNumberFormat, divDecimals, mulDecimals, sleep, uuid } from '../utils';
import { getNetworkFee } from '../blockchain-bridge/eth/helpers';
import { Snip20SendToBridge, Snip20SwapHash } from '../blockchain-bridge';

export enum EXCHANGE_STEPS {
  BASE = 'BASE',
  APPROVE_CONFIRMATION = 'APPROVE_CONFIRMATION',
  SENDING_APPROVE = 'SENDING_APPROVE',
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
  @observable stepNumber = EXCHANGE_STEPS.BASE;
  @observable isFeeLoading = false;
  @observable isTokenApproved = false;
  @observable tokenApprovedLoading = false;

  defaultTransaction = {
    scrtAddress: '',
    ethAddress: '',
    amount: '',
    erc20Address: '',
    snip20Address: '',
    loading: false,
    confirmed: null,
    error: '',
    tokenSelected: {
      symbol: '',
      image: '',
      value: '',
      src_coin: ''
    }
  };

  defaultOperation: IOperation = {
    actions: undefined,
    amount: 0,
    ethAddress: '',
    fee: 0,
    id: '',
    oneAddress: '',
    status: SwapStatus.SWAP_WAIT_SEND,
    timestamp: 0,
    token: undefined,
    type: undefined,
  };

  @observable transaction = this.defaultTransaction;
  @observable mode: EXCHANGE_MODE = EXCHANGE_MODE.ETH_TO_SCRT;
  @observable token: TOKEN;

  // constructor(stores) {
  //   super(stores);
  //
  //   setInterval(async () => {
  //     if (this.operation && this.operation.id) {
  //       const operation = await operationService.getSwap(
  //         this.operation.id,
  //       );
  //       if (this.operation.id === operation.id) {
  //         this.operation = operation;
  //         this.setStatus();
  //       }
  //     }
  //   }, 3000);
  // }

  @computed
  get step() {
    return this.stepsConfig[this.stepNumber];
  }

  @observable ethNetworkFee = 0;
  @observable ethSwapFee = 0;
  @observable swapFeeToken = 0;
  @observable swapFeeUsd = 0;

  @computed
  get networkFee() {
    return this.mode === EXCHANGE_MODE.ETH_TO_SCRT ? this.ethNetworkFee : 0.0134438;
  }

  @computed
  get swapFee() {
    return this.mode === EXCHANGE_MODE.SCRT_TO_ETH ? Number(balanceNumberFormat.format(this.swapFeeToken)) : 0;
  }

  @computed
  get swapFeeUSD() {
    return this.mode === EXCHANGE_MODE.SCRT_TO_ETH ? this.swapFeeUsd : 0;
  }

  stepsConfig = {
    [EXCHANGE_STEPS.BASE]: {
      id: EXCHANGE_STEPS.BASE,
      modal: false,
      onClickSend: async () => {
        this.transaction.erc20Address = this.stores.userMetamask.erc20Address;
        this.transaction.snip20Address = this.stores.user.snip20Address;

        this.stepNumber = EXCHANGE_STEPS.CONFIRMATION

        switch (this.mode) {
          case EXCHANGE_MODE.ETH_TO_SCRT:
            this.transaction.ethAddress = this.stores.userMetamask.ethAddress;

            this.isFeeLoading = true;
            this.ethNetworkFee = await getNetworkFee(Number(process.env.ETH_GAS_LIMIT));
            this.isFeeLoading = false;
            break;
          case EXCHANGE_MODE.SCRT_TO_ETH:
            this.transaction.scrtAddress = this.stores.user.address;
            this.isFeeLoading = true;
            this.ethSwapFee = await getNetworkFee(process.env.SWAP_FEE);
            let token: ITokenInfo;
            if (this.token === TOKEN.ETH) {
              token = this.stores.tokens.allData.find(t => t.name === 'Ethereum');
            } else {
              token = this.stores.tokens.allData.find(t => t.dst_address === this.transaction.snip20Address);
            }
            this.swapFeeUsd = this.ethSwapFee * this.stores.user.ethRate;
            this.swapFeeToken = this.swapFeeUsd / Number(token.price);
            this.isFeeLoading = false;
            break;
        }
      },
      onClickApprove: async () => {
        if (this.mode != EXCHANGE_MODE.ETH_TO_SCRT || this.token === TOKEN.ETH) return
        this.stepNumber = EXCHANGE_STEPS.APPROVE_CONFIRMATION;
        this.isFeeLoading = true;
        this.ethNetworkFee = await getNetworkFee(Number(process.env.ETH_GAS_LIMIT));
        this.isFeeLoading = false;
      },
    },
    [EXCHANGE_STEPS.CONFIRMATION]: {
      id: EXCHANGE_STEPS.CONFIRMATION,
      modal: true,
      onClick: () => this.sendOperation()
    },
    [EXCHANGE_STEPS.SENDING]: {
      id: EXCHANGE_STEPS.SENDING,
      modal: true,
    },
    [EXCHANGE_STEPS.RESULT]: {
      id: EXCHANGE_STEPS.RESULT,
      modal: true,
    },
    [EXCHANGE_STEPS.APPROVE_CONFIRMATION]: {
      id: EXCHANGE_STEPS.APPROVE_CONFIRMATION,
      modal: true,
      onClick: () => this.sendOperation()
    }
  }

  @action.bound
  async checkTokenApprove(address: string) {
    this.isTokenApproved = false
    this.tokenApprovedLoading = true
    try {
      const allowance = await contract.ethMethodsERC20.getAllowance(address);
      if (Number(allowance) > 0) this.isTokenApproved = true
      this.tokenApprovedLoading = false

    } catch (error) {
      console.log('error', error)
      this.tokenApprovedLoading = false
    }

  }

  @action.bound
  setAddressByMode() {
    if (this.mode === EXCHANGE_MODE.ETH_TO_SCRT) {
      this.transaction.scrtAddress = '';
      this.transaction.ethAddress = this.stores.userMetamask.ethAddress;
    } else if (this.mode === EXCHANGE_MODE.SCRT_TO_ETH) {
      this.transaction.ethAddress = '';
      this.transaction.scrtAddress = this.stores.user.address;
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
    //TODO
  }

  @action.bound
  async setOperationId(operationId: string) {
    this.operation = this.defaultOperation;
    this.operation.id = operationId;
    //this.stores.routing.push('/operations/' + this.operation.id);

    const swap = await operationService.getOperation({ id: operationId });

    if (swap.swap) {
      this.operation.type =
        swap.swap.src_network === 'Ethereum' ? EXCHANGE_MODE.ETH_TO_SCRT : EXCHANGE_MODE.SCRT_TO_ETH;
      this.token =
        swap.swap.src_coin === 'native'
          ? TOKEN.ETH
          : this.operation.type === EXCHANGE_MODE.ETH_TO_SCRT
            ? TOKEN.ERC20
            : TOKEN.S20;

      this.operation.status = swap.swap.status;

      if (this.operation.type === EXCHANGE_MODE.ETH_TO_SCRT) {
        this.transaction.ethAddress = swap.swap.src_address;
        this.transaction.scrtAddress = swap.swap.dst_address;

        const decimals = this.stores.tokens.allData.find(t => t.dst_address === swap.swap.dst_address).decimals;

        this.transaction.amount = divDecimals(swap.swap.amount, decimals);
        this.txHash = swap.swap.src_tx_hash;
      } else {
        const decimals = this.stores.tokens.allData.find(t => t.dst_address === swap.swap.src_coin).decimals;

        this.transaction.amount = divDecimals(swap.swap.amount, decimals);

        this.transaction.scrtAddress = swap.swap.src_address;
        this.transaction.ethAddress = swap.swap.dst_address;
        this.transaction.amount = String(swap.swap.amount);
        this.txHash = swap.swap.dst_tx_hash;
      }
    }

    // this.mode = this.operation.type;
    // this.token = this.operation.token;
    // this.transaction.amount = String(this.operation.amount);
    // this.transaction.ethAddress = this.operation.ethAddress;
    // this.transaction.scrtAddress = this.operation.oneAddress;
    // this.transaction.erc20Address = this.operation.erc20Address;

    this.setStatus();
  }

  @action.bound
  async createOperation(transactionHash?: string) {
    let params = transactionHash ? { id: uuid(), transactionHash } : { id: uuid() };

    const operation = await operationService.createOperation(params);

    operation.operation.status = SwapStatus[SwapStatus[operation.operation.status]];

    this.operation = operation.operation;
    return this.operation;
  }

  @action.bound
  async updateOperation(id: string, transactionHash: string) {
    const result = await operationService.updateOperation(id, transactionHash);

    if (result.result === 'failed') {
      throw Error(
        `Failed to update operation ${this.operation.id}, tx hash: ${transactionHash}. Please contact support with these details`,
      );
    }

    return await this.getStatus(id);
  }

  async getStatus(id) {
    return await operationService.getStatus({
      id,
    });
  }

  getActionByType = (type: ACTION_TYPE) => this.operation.actions.find(a => a.type === type);

  @action.bound
  async sendOperation(id: string = '') {
    try {
      this.actionStatus = 'fetching';

      // this is used if you access /operations/<id> directly. i.e. if someone gets bored and hits refresh, or if we want to add a button
      // that links to this view
      if (id) {
        // this is here so we can refresh the page
        this.stores.routing.push(this.operation.id);
        await this.waitForResult();
        this.setStatus();
        return;
      } else {
        console.log('send op without id');
      }

      this.transaction.erc20Address = this.transaction.erc20Address.trim();
      this.transaction.scrtAddress = this.transaction.scrtAddress.trim();
      this.transaction.ethAddress = this.transaction.ethAddress.trim();
      this.txHash = ''
      this.transaction.loading = true

      if (this.mode === EXCHANGE_MODE.SCRT_TO_ETH) {
        await this.swapSnip20ToEth(this.token === TOKEN.ETH);
      } else if (this.mode === EXCHANGE_MODE.ETH_TO_SCRT) {

        if (this.token === TOKEN.ERC20) {
          await this.checkTokenApprove(this.transaction.erc20Address)
          if (!this.isTokenApproved) {
            await this.approveEcr20();
          } else {
            await this.swapErc20ToScrt();
          }
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

  }

  async waitForResult() {
    let lolStatus = await this.getStatus(this.operation.id);
    if (lolStatus === SwapStatus.SWAP_CONFIRMED || lolStatus === SwapStatus.SWAP_FAILED) {
      this.operation.status = lolStatus;
    }

    while (![SwapStatus.SWAP_FAILED, SwapStatus.SWAP_CONFIRMED].includes(this.operation.status)) {
      await sleep(2000);
      lolStatus = await this.getStatus(this.operation.id);
      if (lolStatus === SwapStatus.SWAP_CONFIRMED || lolStatus === SwapStatus.SWAP_FAILED) {
        this.operation.status = lolStatus;
      }
    }
  }

  async approveEcr20() {
    this.operation = this.defaultOperation;
    this.operation.status = SwapStatus.SWAP_WAIT_APPROVE;


    await this.createOperation();
    //this.stores.routing.push('/' + TOKEN.ETH + '/operations/' + this.operation.id);

    contract.ethMethodsERC20.callApprove(
      this.transaction.erc20Address,
      this.transaction.amount,
      this.stores.userMetamask.erc20TokenDetails.decimals, async (result) => {
        if (result.hash) {
          //this.updateOperation(this.operation.id, { transactionHash: result.hash });
          this.tokenApprovedLoading = true
          this.transaction.loading = true
          this.txHash = result.hash
        }

        if (result.receipt) {
          //this.updateOperation(this.operation.id, { confirmations: result.confirmation });
          this.isTokenApproved = true
          this.tokenApprovedLoading = false
          this.transaction.loading = false
          this.transaction.confirmed = result.receipt
        }

        if (result.error) {
          //this.updateOperation(this.operation.id, { error: result.error });
          this.tokenApprovedLoading = false
          this.transaction.loading = false
          this.transaction.error = result.error
          this.stepNumber = EXCHANGE_STEPS.BASE
        }

      });
  }

  async swapErc20ToScrt() {
    this.operation = this.defaultOperation;
    this.operation.status = SwapStatus.SWAP_WAIT_APPROVE;
    this.setStatus();

    await this.createOperation();
    //this.stores.routing.push(TOKEN.ETH + '/operations/' + this.operation.id);


    contract.ethMethodsERC20.swapToken(
      this.transaction.erc20Address,
      this.transaction.scrtAddress,
      this.transaction.amount,
      this.stores.userMetamask.erc20TokenDetails.decimals, async (result) => {
        if (result.hash) {
          //this.updateOperation(this.operation.id, { transactionHash: result.hash });
          this.transaction.loading = true
          this.txHash = result.hash
        }

        if (result.receipt) {
          //this.updateOperation(this.operation.id, { confirmations: result.confirmation });
          this.transaction.loading = false
          this.transaction.confirmed = result.receipt
        }

        if (result.error) {
          //this.updateOperation(this.operation.id, { error: result.error });

          this.transaction.error = result.error
          this.transaction.loading = false
          this.stepNumber = EXCHANGE_STEPS.BASE
        }

      });

    return;
  }

  async swapEthToScrt() {
    this.operation = this.defaultOperation;

    await this.createOperation();
    //this.stores.routing.push(TOKEN.ETH + '/operations/' + this.operation.id);


    contract.ethMethodsETH.swapEth(this.transaction.scrtAddress, this.transaction.amount, async (result) => {
      if (result.hash) {
        //this.updateOperation(this.operation.id, { transactionHash: result.hash });
        this.transaction.loading = true
        this.txHash = result.hash
      }

      if (result.receipt) {
        //this.updateOperation(this.operation.id, { confirmations: result.confirmation });
        this.transaction.loading = false
        this.transaction.confirmed = result.receipt
      }

      if (result.error) {
        //this.updateOperation(this.operation.id, { error: result.error });
        this.transaction.error = result.error
        this.transaction.loading = false
        this.stepNumber = EXCHANGE_STEPS.BASE
      }

    });

    return;
  }

  async swapSnip20ToEth(isEth: boolean) {
    this.operation = this.defaultOperation;
    this.setStatus();

    let proxyContract: string;
    let decimals: number | string;
    let recipient = process.env.SCRT_SWAP_CONTRACT;
    let price: string;
    if (isEth) {
      decimals = 18;
      const token = this.stores.tokens.allData.find(t => t.src_coin === 'Ethereum');
      price = token.price;
      this.transaction.snip20Address = token.dst_address;
    } else {
      const token = this.stores.tokens.allData.find(t => t.dst_address === this.transaction.snip20Address);
      if (token) {
        decimals = token.decimals;
        price = token.price;
        this.transaction.snip20Address = token.dst_address;
        if (token.display_props.proxy) {
          proxyContract = process.env.WSCRT_PROXY_CONTRACT;
          recipient = process.env.WSCRT_PROXY_CONTRACT;
          this.transaction.snip20Address = process.env.SSCRT_CONTRACT;
        }
      }
    }

    const amount = mulDecimals(this.transaction.amount, decimals).toString();

    await this.createOperation();
    //this.stores.routing.push(TOKEN.S20 + '/operations/' + this.operation.id);

    try {
      this.txHash = await Snip20SendToBridge({
        recipient,
        secretjs: this.stores.user.secretjs,
        address: this.transaction.snip20Address,
        amount,
        msg: btoa(this.transaction.ethAddress),
      });
      this.transaction.confirmed = true
      this.transaction.loading = false
      console.log('this.txHash', this.txHash)
    } catch (e) {
      this.operation.status = SwapStatus.SWAP_FAILED;
      this.setStatus();
      //throw e;
    }

    // this.operation.status = await this.updateOperation(
    //   this.operation.id,
    //   Snip20SwapHash({
    //     tx_id: this.txHash,
    //     address: proxyContract || this.transaction.snip20Address,
    //   }),
    // );

  }

  clear() {
    this.transaction = this.defaultTransaction;
    this.operation = null;
    this.error = '';
    this.txHash = '';
    this.actionStatus = 'init';
    this.stepNumber = EXCHANGE_STEPS.BASE;
    this.stores.routing.push(`/${this.token}`);
  }
}

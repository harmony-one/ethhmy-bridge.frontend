import { StoreConstructor } from './core/StoreConstructor';
import { action, computed, observable } from 'mobx';
import { statusFetching, SwapStatus } from '../constants';
import { ACTION_TYPE, EXCHANGE_MODE, IOperation, ITokenInfo, TOKEN } from './interfaces';
import * as operationService from 'services';
import * as contract from '../blockchain-bridge';
import { balanceNumberFormat, divDecimals, mulDecimals, sleep, uuid } from '../utils';
import { getNetworkFee } from '../blockchain-bridge/eth/helpers';
import { web3 } from '../blockchain-bridge/eth';
import { Snip20SendToBridge, Snip20SwapHash } from '../blockchain-bridge';

export enum EXCHANGE_STEPS {
  BASE = 'BASE',
  APPROVE_CONFIRMATION = 'APPROVE_CONFIRMATION',
  SENDING_APPROVE = 'SENDING_APPROVE',
  CONFIRMATION = 'CONFIRMATION',
  SENDING = 'SENDING',
  RESULT = 'RESULT',
  CHECK_TRANSACTION = 'CHECK_TRANSACTION'
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
  @observable confirmations = 0;
  @observable fetchOperationInterval = 0;
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
    transactionHash: '',
    fee: 0,
    id: '',
    oneAddress: '',
    status: null,
    timestamp: 0,
    token: undefined,
    type: undefined,
    swap: null
  };

  @observable transaction = this.defaultTransaction;
  @observable mode: EXCHANGE_MODE = EXCHANGE_MODE.ETH_TO_SCRT;
  @observable token: TOKEN;


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
    [EXCHANGE_STEPS.APPROVE_CONFIRMATION]: {
      id: EXCHANGE_STEPS.APPROVE_CONFIRMATION,
      modal: true,
      onClick: () => this.sendOperation()
    },
    [EXCHANGE_STEPS.CHECK_TRANSACTION]: {
      id: EXCHANGE_STEPS.CHECK_TRANSACTION,
      modal: true,
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
  fetchStatus(id) {

    const fetcher = async () => {
      const result = await operationService.getOperation({ id });
      const swap = result.swap
      function isEthHash(addr) { return /^0x([A-Fa-f0-9]{64})$/.test(addr); }

      if (result.operation.transactionHash && isEthHash(result.operation.transactionHash))
        this.operation.transactionHash = result.operation.transactionHash

      if (swap) {
        this.operation.status = swap.status
        if (isEthHash(swap.src_tx_hash)) this.operation.transactionHash = swap.src_tx_hash
        if (isEthHash(swap.dst_tx_hash)) this.operation.transactionHash = swap.dst_tx_hash

        this.operation.swap = swap

        this.operation.type = swap.src_network === 'Ethereum' ? EXCHANGE_MODE.ETH_TO_SCRT : EXCHANGE_MODE.SCRT_TO_ETH;

        if (this.operation.type === EXCHANGE_MODE.ETH_TO_SCRT) {
          const token = this.stores.tokens.allData.find(t => t.dst_address === swap.dst_address);
          if (token) {
            this.operation.image = token.display_props.image
            this.operation.symbol = token.display_props.symbol
            this.operation.swap.amount = Number(divDecimals(swap.amount, token.decimals));
          }
        } else {
          const token = this.stores.tokens.allData.find(t => t.dst_address === swap.src_coin);
          if (token) {
            this.operation.image = token.display_props.image
            this.operation.symbol = `secret ${token.display_props.symbol}`
            this.operation.swap.amount = Number(divDecimals(swap.amount, token.decimals));
          }
        }

        try {

          const etherHash = swap.dst_network === "Ethereum" ? swap.dst_tx_hash : swap.src_tx_hash
          const blockNumber = await web3.eth.getBlockNumber()
          const tx = await web3.eth.getTransaction(etherHash)
          if (tx.blockNumber) this.confirmations = blockNumber - tx.blockNumber
          if (this.confirmations < 0) this.confirmations = 0

        } catch (error) { }

      }

    }

    fetcher()

    clearInterval(this.fetchOperationInterval)
    this.fetchOperationInterval = setInterval(async () => {
      fetcher()
    }, 3000)

  }

  @action.bound
  async setOperationId(operationId: string) {
    this.operation = this.defaultOperation;
    this.operation.id = operationId;
    //await this.waitForResult();
    this.stepNumber = EXCHANGE_STEPS.CHECK_TRANSACTION

    this.fetchStatus(this.operation.id)

  }

  @action.bound
  async createOperation(transactionHash?: string) {
    clearInterval(this.fetchOperationInterval)
    let params = transactionHash ? { id: uuid(), transactionHash } : { id: uuid() };
    this.operation = this.defaultOperation
    this.confirmations = 0
    this.txHash = ""
    this.operation.id = params.id
    const operation = await operationService.createOperation(params);

    operation.operation.status = SwapStatus[SwapStatus[operation.operation.status]];
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
      this.confirmations = 0
      this.transaction.erc20Address = this.transaction.erc20Address.trim();
      this.transaction.scrtAddress = this.transaction.scrtAddress.trim();
      this.transaction.ethAddress = this.transaction.ethAddress.trim();
      this.txHash = ''
      this.transaction.loading = true
      this.transaction.error = ''

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
        this.transaction.error = e.response.body.message;
      } else {
        this.transaction.error = e.message;
      }
      this.actionStatus = 'error';
      this.operation = null;
    }

  }


  async approveEcr20() {
    this.operation = this.defaultOperation;
    //this.operation.status = SwapStatus.SWAP_WAIT_APPROVE;


    //await this.createOperation();
    //this.stores.routing.push('/operations/' + this.operation.id);

    contract.ethMethodsERC20.callApprove(
      this.transaction.erc20Address,
      this.transaction.amount,
      this.stores.userMetamask.erc20TokenDetails.decimals, async (result) => {
        if (result.hash) {
          this.updateOperation(this.operation.id, result.hash);
          this.tokenApprovedLoading = true
          this.transaction.loading = true
          this.txHash = result.hash
        }

        if (result.receipt) {
          this.isTokenApproved = true
          this.tokenApprovedLoading = false
          this.transaction.loading = false
        }

        if (result.error) {
          this.tokenApprovedLoading = false
          this.transaction.loading = false
          this.transaction.error = result.error.message
        }

      });
  }

  async swapErc20ToScrt() {
    this.operation = this.defaultOperation;
    this.operation.status = SwapStatus.SWAP_WAIT_APPROVE;

    await this.createOperation();
    this.fetchStatus(this.operation.id);


    contract.ethMethodsERC20.swapToken(
      this.transaction.erc20Address,
      this.transaction.scrtAddress,
      this.transaction.amount,
      this.stores.userMetamask.erc20TokenDetails.decimals, async (result) => {
        if (result.hash) {
          this.updateOperation(this.operation.id, result.hash);
          this.transaction.loading = false
          this.txHash = result.hash
          this.transaction.confirmed = true
          this.stores.routing.push('/operations/' + this.operation.id);
        }

        if (result.receipt) {
          this.transaction.loading = false
          this.transaction.confirmed = result.receipt
        }

        if (result.error) {
          this.transaction.error = result.error.message
          this.transaction.loading = false
          //this.stepNumber = EXCHANGE_STEPS.BASE
        }

      });

    return;
  }

  async swapEthToScrt() {
    this.operation = this.defaultOperation;

    await this.createOperation();
    this.fetchStatus(this.operation.id);


    contract.ethMethodsETH.swapEth(this.transaction.scrtAddress, this.transaction.amount, async (result) => {
      if (result.hash) {
        this.updateOperation(this.operation.id, result.hash);
        this.transaction.loading = false
        this.txHash = result.hash
        this.transaction.confirmed = true
        this.stores.routing.push('/operations/' + this.operation.id);
      }

      if (result.receipt) {
        this.transaction.loading = false
        this.transaction.confirmed = true
      }

      if (result.error) {
        this.transaction.error = result.error.message
        this.transaction.loading = false
        //this.stepNumber = EXCHANGE_STEPS.BASE
      }

    });

    return;
  }

  async swapSnip20ToEth(isEth: boolean) {
    this.operation = this.defaultOperation;

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
    this.stores.routing.push('/operations/' + this.operation.id);

    let tx_id = '';
    try {
      tx_id = await Snip20SendToBridge({
        recipient,
        secretjs: this.stores.user.secretjs,
        address: this.transaction.snip20Address,
        amount,
        msg: btoa(this.transaction.ethAddress),
      });
      this.transaction.confirmed = true
      this.transaction.loading = false

      this.fetchStatus(this.operation.id);
      this.operation.status = await this.updateOperation(
        this.operation.id,
        Snip20SwapHash({
          tx_id,
          address: proxyContract || this.transaction.snip20Address,
        }),
      );
    } catch (e) {
      this.operation.status = SwapStatus.SWAP_FAILED;
      //throw e;
    }



  }

  clear() {
    this.transaction = this.defaultTransaction;
    this.operation = null;
    this.txHash = '';
    this.actionStatus = 'init';
    this.stepNumber = EXCHANGE_STEPS.BASE;
    this.stores.routing.push(`/`);
  }
}

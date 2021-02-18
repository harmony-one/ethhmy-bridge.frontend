import React from 'react';
import { SigningCosmWasmClient } from 'secretjs';
import { Button, Container, Message } from 'semantic-ui-react';
import { UINT128_MAX, sortedStringify, humanizeBalance, displayHumanizedBalance, canonicalizeBalance } from 'utils';
import { flexRowSpace, Pair, swapContainerStyle, TokenDisplay } from '.';
import { AssetRow } from './AssetRow';
import { TabsHeader } from './TabsHeader';
import { PriceRow } from './PriceRow';
import { UserStoreEx } from 'stores/UserStore';
import { Coin } from 'secretjs/types/types';
import BigNumber from 'bignumber.js';
import { compareNormalize } from './utils';
import { getFeeForExecute } from '../../blockchain-bridge/scrt';
import { CreateNewPair } from '../../blockchain-bridge/scrt/swap';
import { Asset } from './trade';
import { PairAnalyticsLink } from './PairAnalyticsLink';

const plus = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#00ADE8"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const buttonStyle = {
  margin: '0.5em 0 0 0',
  borderRadius: '12px',
  padding: '18px',
  fontSize: '20px',
};

// const BUTTON_MSG_ENTER_AMOUNT = 'Enter an amount';
// const BUTTON_MSG_NO_TRADNIG_PAIR = ;
// const BUTTON_MSG_LOADING_PRICE =
// const BUTTON_MSG_PROVIDE = 'Provide';

enum ProvideState {
  READY,
  LOADING,
  PAIR_NOT_EXIST,
  WAITING_FOR_INPUT,
  INSUFFICIENT_A_BALANCE,
  INSUFFICIENT_B_BALANCE,
  PAIR_LIQUIDITY_ZERO,
  UNLOCK_TOKENS,
  CREATE_NEW_PAIR,
}

const ButtonMessage = (state: ProvideState): string => {
  switch (state) {
    case ProvideState.INSUFFICIENT_A_BALANCE:
      return 'Insufficient Balance';
    case ProvideState.INSUFFICIENT_B_BALANCE:
      return 'Insufficient Balance';
    case ProvideState.LOADING:
      return 'Loading tokens';
    case ProvideState.PAIR_LIQUIDITY_ZERO:
      return 'Add Initial Liquidity';
    case ProvideState.PAIR_NOT_EXIST:
      return 'Trading pair does not exist';
    case ProvideState.READY:
      return 'Provide';
    case ProvideState.WAITING_FOR_INPUT:
      return 'Enter an Amount';
    case ProvideState.UNLOCK_TOKENS:
      return 'Unlock Tokens';
    case ProvideState.CREATE_NEW_PAIR:
      return 'Create New Pair';
    default:
      return 'Provide';
  }
};

export class ProvideTab extends React.Component<
  {
    user: UserStoreEx;
    secretjs: SigningCosmWasmClient;
    tokens: {
      [symbol: string]: TokenDisplay;
    };
    balances: {
      [symbol: string]: BigNumber | JSX.Element;
    };
    pairs: Array<Pair>;
    pairFromSymbol: {
      [symbol: string]: Pair;
    };
    notify: (type: 'success' | 'error', msg: string, closesAfterMs?: number) => void;
  },
  {
    tokenA: string;
    tokenB: string;
    inputA: string;
    inputB: string;
    isEstimatedA: boolean;
    isEstimatedB: boolean;
    allowanceA: BigNumber;
    allowanceB: BigNumber;
    buttonMessage: string;
    loadingProvide: boolean;
    loadingApproveA: boolean;
    loadingApproveB: boolean;
    provideState: ProvideState;
    selectedPairSymbol: string;
  }
> {
  constructor(props) {
    super(props);

    this.state = {
      tokenA: '',
      tokenB: '',
      inputA: '',
      inputB: '',
      allowanceA: new BigNumber(0),
      allowanceB: new BigNumber(0),
      isEstimatedA: false,
      isEstimatedB: false,
      buttonMessage: '',
      loadingProvide: false,
      loadingApproveA: false,
      loadingApproveB: false,
      provideState: ProvideState.UNLOCK_TOKENS,
      selectedPairSymbol: '',
    };
  }

  componentDidMount() {
    const firstPairSymbol = Object.keys(this.props.pairFromSymbol)[0];
    if (firstPairSymbol) {
      const [tokenA, tokenB] = firstPairSymbol.split('/');
      this.setState({ tokenA, tokenB }, () => {
        const pair = this.props.pairFromSymbol[firstPairSymbol];
        this.updateAllowance(pair, tokenA);
        this.updateAllowance(pair, tokenB);
      });
    }
  }

  componentDidUpdate(previousProps) {
    if (sortedStringify(previousProps.balances) !== sortedStringify(this.props.balances)) {
      this.updateInputs();
    }

    if (sortedStringify(previousProps.pairFromSymbol) !== sortedStringify(this.props.pairFromSymbol)) {
      const firstPairSymbol = Object.keys(this.props.pairFromSymbol)[0];
      if (firstPairSymbol) {
        const [tokenA, tokenB] = firstPairSymbol.split('/');
        this.setState(
          {
            tokenA,
            tokenB,
          },
          () => {
            const pair = this.props.pairFromSymbol[`${tokenA}/${tokenB}`];
            this.updateAllowance(pair, tokenA);
            this.updateAllowance(pair, tokenB);
          },
        );
      }
    }

    const selectedPairSymbol = `${this.state.tokenA}/${this.state.tokenB}`;
    const pair = this.props.pairFromSymbol[selectedPairSymbol];
    const newProvideState = this.getProvideState(pair);
    if (newProvideState !== this.state.provideState) {
      this.setState({ provideState: newProvideState });
    }
  }

  private getTokenBalances(): (BigNumber | JSX.Element)[] {
    return [this.props.balances[this.state.tokenA], this.props.balances[this.state.tokenB]];
  }

  private getDecimalsB(): number {
    return this.props.tokens[this.state.tokenB]?.decimals;
  }

  private getDecimalsA(): number {
    return this.props.tokens[this.state.tokenA]?.decimals;
  }

  async updateAllowance(pair: Pair, symbol: string) {
    let stateField: string;
    if (this.state.tokenA === symbol) {
      stateField = 'allowanceA';
    } else if (this.state.tokenB === symbol) {
      stateField = 'allowanceB';
    } else {
      console.error('updateAllowance for non-selected token', symbol);
      return;
    }

    if (symbol === 'SCRT') {
      this.setState<never>({ [stateField]: new BigNumber(Infinity) });
      return;
    }

    if (!pair) {
      console.error('updateAllowance for non-existent pair');
      return;
    }

    const result: {
      allowance: {
        owner: string;
        spender: string;
        allowance: string;
        expiration: number;
      };
    } = await this.props.secretjs.queryContractSmart(this.props.tokens[symbol].address, {
      allowance: {
        owner: this.props.user.address,
        spender: pair.contract_addr,
        key: 'SecretSwap',
      },
    });

    let allowance = new BigNumber(result.allowance.allowance);
    if (allowance.isNaN()) {
      allowance = new BigNumber(0);
    }

    console.log(`Allowance for ${symbol} is ${allowance} (${result.allowance.allowance})`);

    this.setState<never>({ [stateField]: allowance });
  }

  async updateInputs() {
    const selectedPairSymbol = `${this.state.tokenA}/${this.state.tokenB}`;

    if (selectedPairSymbol !== this.state.selectedPairSymbol) {
      this.setState({ selectedPairSymbol });
    }

    const pair = this.props.pairFromSymbol[selectedPairSymbol];
    if (!pair) {
      this.setState({
        inputA: '',
        isEstimatedA: false,
        inputB: '',
        isEstimatedB: false,
      });
      return;
    }

    const humanPoolA = humanizeBalance(this.getPoolA(), this.getDecimalsA());
    const humanPoolB = humanizeBalance(this.getPoolB(), this.getDecimalsB());

    if (humanPoolA.isNaN() || humanPoolB.isNaN() || humanPoolA.isEqualTo(0) || humanPoolB.isEqualTo(0)) {
      return;
    }

    if (this.state.isEstimatedB) {
      // inputB/inputA = poolB/poolA
      // =>
      // inputB = inputA*(poolB/poolA)
      const inputB = Number(this.state.inputA) * humanPoolB.dividedBy(humanPoolA).toNumber();

      if (isNaN(inputB) || this.state.inputA === '') {
        this.setState({
          isEstimatedA: false,
          inputB: '',
          isEstimatedB: false,
        });
      } else {
        const nf = new Intl.NumberFormat('en-US', {
          maximumFractionDigits: this.props.tokens[this.state.tokenB].decimals,
          useGrouping: false,
        });
        this.setState({
          inputB: inputB < 0 ? '' : nf.format(inputB),
          isEstimatedB: inputB >= 0,
        });
      }
    } else if (this.state.isEstimatedA) {
      // inputA/inputB = poolA/poolB
      // =>
      // inputA = inputB*(poolA/poolB)
      const inputA = Number(this.state.inputB) * humanPoolA.dividedBy(humanPoolB).toNumber();

      if (isNaN(inputA) || this.state.inputB === '') {
        this.setState({
          isEstimatedB: false,
          inputA: '',
          isEstimatedA: false,
        });
      } else {
        const nf = new Intl.NumberFormat('en-US', {
          maximumFractionDigits: this.props.tokens[this.state.tokenA].decimals,
          useGrouping: false,
        });
        this.setState({
          isEstimatedB: false,
          inputA: inputA < 0 ? '' : nf.format(inputA),
          isEstimatedA: inputA >= 0,
        });
      }
    }
  }

  async approveOnClick(pair: Pair, symbol: string) {
    let stateFieldSuffix: string;
    if (this.state.tokenA === symbol) {
      stateFieldSuffix = 'A';
    } else if (this.state.tokenB === symbol) {
      stateFieldSuffix = 'B';
    } else {
      console.error('approveOnClick for non-selected token', symbol);
      return;
    }

    this.setState<never>({
      [`loadingApprove${stateFieldSuffix}`]: true,
    });

    try {
      await this.props.secretjs.execute(
        this.props.tokens[symbol].address,
        {
          increase_allowance: {
            spender: pair.contract_addr,
            amount: UINT128_MAX,
          },
        },
        '',
        [],
        getFeeForExecute(150_000),
      );
      this.setState<never>({
        [`allowance${stateFieldSuffix}`]: new BigNumber(Infinity),
      });
      this.props.notify('success', `${symbol} approved for ${this.state.tokenA}/${this.state.tokenB}`);
    } catch (error) {
      console.error('Error while trying to approve', symbol, error);
      this.props.notify('error', `Error approving ${symbol}: ${error.message}`);
    }

    this.setState<never>({
      [`loadingApprove${stateFieldSuffix}`]: false,
    });
  }

  getProvideState(pair: Pair): ProvideState {
    const [balanceA, balanceB] = this.getTokenBalances();
    const decimalsA = this.getDecimalsA();
    const decimalsB = this.getDecimalsB();

    if (!(this.state.tokenB && this.state.tokenA)) {
      return ProvideState.LOADING;
    }

    if (!pair) {
      return ProvideState.CREATE_NEW_PAIR;
    } else if (this.getPoolA().isZero() && this.getPoolB().isZero()) {
      return ProvideState.PAIR_LIQUIDITY_ZERO;
    } else if (this.state.inputA === '' || this.state.inputB === '') {
      return ProvideState.WAITING_FOR_INPUT;
    } else if (!(balanceA instanceof BigNumber && balanceB instanceof BigNumber)) {
      return ProvideState.READY;
    } else if (compareNormalize(this.state.inputA, { amount: balanceA, decimals: decimalsA })) {
      return ProvideState.INSUFFICIENT_A_BALANCE;
    } else if (compareNormalize(this.state.inputB, { amount: balanceB, decimals: decimalsB })) {
      return ProvideState.INSUFFICIENT_B_BALANCE;
    } else {
      return ProvideState.READY;
    }
  }

  render() {
    const selectedPairSymbol = `${this.state.tokenA}/${this.state.tokenB}`;
    const pair = this.props.pairFromSymbol[selectedPairSymbol];

    const buttonMessage = ButtonMessage(this.state.provideState);

    const [balanceA, balanceB] = this.getTokenBalances();

    const decimalsA = this.getDecimalsA();
    const decimalsB = this.getDecimalsB();

    const poolA = this.getPoolA();
    const poolB = this.getPoolB();

    const price = this.getPrice();

    const amountA = canonicalizeBalance(new BigNumber(this.state.inputA), decimalsA);
    const amountB = canonicalizeBalance(new BigNumber(this.state.inputB), decimalsB);

    const showApproveAButton: boolean = this.state.tokenA !== 'SCRT' && pair && this.state.allowanceA.lt(amountA);
    const showApproveBButton: boolean = this.state.tokenB !== 'SCRT' && pair && this.state.allowanceB.lt(amountB);

    const lpTokenBalance = this.props.balances[`LP-${selectedPairSymbol}`];
    const lpTokenTotalSupply = new BigNumber(this.props.balances[`LP-${selectedPairSymbol}-total-supply`] as BigNumber);
    const currentShareOfPool = lpTokenTotalSupply.isZero()
      ? lpTokenTotalSupply
      : new BigNumber(lpTokenBalance as BigNumber).dividedBy(lpTokenTotalSupply);

    const gainedShareOfPool = BigNumber.minimum(
      amountA.dividedBy(poolA.plus(amountA)),
      amountB.dividedBy(poolB.plus(amountB)),
    );

    return (
      <Container style={swapContainerStyle}>
        <TabsHeader />
        <AssetRow
          secretjs={this.props.secretjs}
          label="Input"
          maxButton={true}
          balance={balanceA}
          tokens={this.props.tokens}
          token={this.state.tokenA}
          setToken={(symbol: string) => {
            if (symbol === this.state.tokenB) {
              // switch
              this.setState(
                {
                  tokenA: symbol,
                  isEstimatedA: this.state.isEstimatedB,
                  inputA: this.state.inputB,
                  allowanceA: this.state.allowanceB,
                  tokenB: this.state.tokenA,
                  isEstimatedB: this.state.isEstimatedA,
                  inputB: this.state.inputA,
                  allowanceB: this.state.allowanceA,
                },
                () => this.updateInputs(),
              );
            } else {
              this.setState(
                {
                  tokenA: symbol,
                  inputA: '',
                  isEstimatedA: true,
                  isEstimatedB: false,
                },
                () => {
                  this.updateInputs();

                  const pair = this.props.pairFromSymbol[`${this.state.tokenA}/${this.state.tokenB}`];
                  this.updateAllowance(pair, this.state.tokenA);
                  this.updateAllowance(pair, this.state.tokenB);
                },
              );
            }
          }}
          amount={this.state.inputA}
          isEstimated={false}
          setAmount={(value: string) => {
            if (value === '' || Number(value) === 0) {
              this.setState(
                {
                  inputA: value,
                  isEstimatedA: false,
                  isEstimatedB: false,
                },
                () => this.updateInputs(),
              );
              return;
            }

            this.setState(
              {
                inputA: value,
                isEstimatedA: false,
                isEstimatedB: true,
              },
              () => this.updateInputs(),
            );
          }}
        />
        <div
          style={{
            padding: '1em',
            display: 'flex',
            alignContent: 'center',
          }}
        >
          {flexRowSpace}
          <span>{plus}</span>
          {flexRowSpace}
        </div>
        <AssetRow
          secretjs={this.props.secretjs}
          label="Input"
          maxButton={true}
          balance={balanceB}
          tokens={this.props.tokens}
          token={this.state.tokenB}
          setToken={(symbol: string) => {
            if (symbol === this.state.tokenA) {
              // switch
              this.setState(
                {
                  tokenB: symbol,
                  isEstimatedB: this.state.isEstimatedA,
                  inputB: this.state.inputA,
                  allowanceB: this.state.allowanceA,
                  tokenA: this.state.tokenB,
                  isEstimatedA: this.state.isEstimatedB,
                  inputA: this.state.inputB,
                  allowanceA: this.state.allowanceB,
                },
                () => this.updateInputs(),
              );
            } else {
              this.setState(
                {
                  tokenB: symbol,
                  inputB: '',
                  isEstimatedB: true,
                  isEstimatedA: false,
                },
                () => {
                  this.updateInputs();

                  const pair = this.props.pairFromSymbol[`${this.state.tokenA}/${this.state.tokenB}`];
                  if (pair) {
                    this.updateAllowance(pair, this.state.tokenA);
                    this.updateAllowance(pair, this.state.tokenB);
                  }
                },
              );
            }
          }}
          amount={this.state.inputB}
          isEstimated={false}
          setAmount={(value: string) => {
            if (value === '' || Number(value) === 0) {
              this.setState(
                {
                  isEstimatedA: false,
                  inputB: value,
                  isEstimatedB: false,
                },
                () => this.updateInputs(),
              );
              return;
            }

            this.setState(
              {
                inputB: value,
                isEstimatedB: false,
                isEstimatedA: true,
              },
              () => this.updateInputs(),
            );
          }}
        />
        {!price.isNaN() && (
          <PriceRow fromToken={this.state.tokenA} toToken={this.state.tokenB} price={price.toNumber()} />
        )}
        {lpTokenBalance !== undefined && (
          <div
            style={{
              display: 'flex',
              paddingTop: '0.5rem',
            }}
          >
            Your Current Share of Pool
            {flexRowSpace}
            {(() => {
              if (JSON.stringify(lpTokenBalance).includes('View')) {
                return lpTokenBalance;
              } else {
                return `${currentShareOfPool.multipliedBy(100).toFixed(2)}%`;
              }
            })()}
          </div>
        )}
        {gainedShareOfPool.isGreaterThan(0) && (
          <div
            style={{
              display: 'flex',
              paddingTop: '0.5rem',
            }}
          >
            Expected Gain in Your Share of Pool
            {flexRowSpace}
            {`~${gainedShareOfPool.multipliedBy(100).toFixed(2)}%`}
          </div>
        )}
        <PairAnalyticsLink pairAddress={this.props.pairFromSymbol[selectedPairSymbol]?.contract_addr} />
        <div hidden={!this.showPoolWarning()}>
          <NewPoolWarning
            inputA={this.state.inputA}
            inputB={this.state.inputB}
            tokenA={this.state.tokenA}
            tokenB={this.state.tokenB}
          />
        </div>
        <div hidden={!showApproveAButton}>
          <ApproveButton
            disabled={this.state.loadingApproveA}
            loading={this.state.loadingApproveA}
            onClick={() => {
              this.approveOnClick(pair, this.state.tokenA).then(() => {});
            }}
            token={this.state.tokenA}
          />
        </div>
        <div hidden={!showApproveBButton}>
          <ApproveButton
            disabled={this.state.loadingApproveB}
            loading={this.state.loadingApproveB}
            onClick={() => {
              this.approveOnClick(pair, this.state.tokenB).then(() => {});
            }}
            token={this.state.tokenB}
          />
        </div>
        <Button
          disabled={
            !this.isReadyForNewPool() &&
            (!this.isReadyForProvide() ||
              this.state.inputA === '' ||
              this.state.inputB === '' ||
              this.state.loadingProvide ||
              showApproveAButton ||
              showApproveBButton)
          }
          loading={this.state.loadingProvide}
          primary={
            (this.isReadyForProvide() || this.state.provideState === ProvideState.CREATE_NEW_PAIR) &&
            !showApproveAButton &&
            !showApproveBButton
          }
          fluid
          style={buttonStyle}
          onClick={async () => {
            if (this.isReadyForProvide()) {
              await this.provideLiquidityAction(pair);
            } else if (this.isReadyForNewPool()) {
              const assetA = Asset.fromTokenDisplay(this.props.tokens[this.state.tokenA]);
              const assetB = Asset.fromTokenDisplay(this.props.tokens[this.state.tokenB]);

              try {
                await this.createNewPairAction(assetA, assetB);
                window.dispatchEvent(new Event('updatePairsAndTokens'));
                this.props.notify('success', `${assetA.symbol}/${assetB.symbol} pair created successfully`);
              } catch (error) {
                console.log('hello');
                this.props.notify('error', `Error creating pair ${assetA.symbol}/${assetB.symbol}: ${error.message}`);
              }
            }
          }}
        >
          {buttonMessage}
        </Button>
      </Container>
    );
  }

  private isReadyForNewPool() {
    return this.state.provideState === ProvideState.CREATE_NEW_PAIR;
  }

  private async createNewPairAction(tokenA: Asset, tokenB: Asset): Promise<string> {
    const result = await CreateNewPair({
      secretjs: this.props.secretjs,
      tokenA,
      tokenB,
      notify: this.props.notify,
    });

    return result.contractAddress;
  }

  private async provideLiquidityAction(pair: Pair) {
    this.setState({
      loadingProvide: true,
    });

    const msg = {
      provide_liquidity: {
        assets: [],
      },
    };

    let transferAmount: Array<Coin> = [];
    for (const i of ['A', 'B']) {
      const { decimals } = this.props.tokens[this.state['token' + i]];

      const amount: string = canonicalizeBalance(new BigNumber(this.state['input' + i]), decimals).toFixed(
        0,
        BigNumber.ROUND_DOWN,
        /*
          should be 0 fraction digits because of canonicalizeBalance,
          but to be sure we're rounding down to prevent over-spending
          */
      );

      if (this.state['token' + i] === 'SCRT') {
        msg.provide_liquidity.assets.push({
          info: {
            native_token: {
              denom: 'uscrt',
            },
          },
          amount: amount,
        });
        transferAmount = [{ amount: amount, denom: 'uscrt' }];
      } else {
        const token = this.props.tokens[this.state['token' + i]];
        msg.provide_liquidity.assets.push({
          info: {
            token: {
              contract_addr: token.address,
              token_code_hash: token.token_code_hash,
              viewing_key: '',
            },
          },
          amount: amount,
        });
      }
    }
    const { inputA, inputB, tokenA, tokenB } = this.state;

    try {
      await this.props.secretjs.execute(pair.contract_addr, msg, '', transferAmount, getFeeForExecute(500_000));

      this.props.notify('success', `Provided ${inputA} ${tokenA} + ${inputB} ${tokenB}`);

      this.setState({
        inputA: '',
        inputB: '',
        isEstimatedA: false,
        isEstimatedB: false,
      });
    } catch (error) {
      console.error('Error while trying to add liquidity', error);
      this.props.notify('error', `Error providing to ${tokenA}/${tokenB}: ${error.message}`);
    }

    this.setState({
      loadingProvide: false,
    });
  }

  private showPoolWarning(): boolean {
    console.log(this.state.provideState);
    return (
      this.state.provideState === ProvideState.PAIR_NOT_EXIST ||
      this.state.provideState === ProvideState.CREATE_NEW_PAIR ||
      this.state.provideState === ProvideState.PAIR_LIQUIDITY_ZERO
    );
  }

  private getPrice() {
    return humanizeBalance(this.getPoolA(), this.getDecimalsA()).dividedBy(
      humanizeBalance(this.getPoolB(), this.getDecimalsB()),
    );
  }

  private isReadyForProvide() {
    return (
      this.state.provideState === ProvideState.READY || this.state.provideState === ProvideState.PAIR_LIQUIDITY_ZERO
    );
  }

  private getPoolA() {
    return new BigNumber(
      this.props.balances[`${this.state.tokenA}-${this.state.tokenA}/${this.state.tokenB}`] as BigNumber,
    );
  }

  private getPoolB() {
    return new BigNumber(
      this.props.balances[`${this.state.tokenB}-${this.state.tokenA}/${this.state.tokenB}`] as BigNumber,
    );
  }
}

const ApproveButton = (props: { disabled: boolean; loading: boolean; onClick: any; token: string }) => (
  <Button disabled={props.disabled} loading={props.loading} primary fluid style={buttonStyle} onClick={props.onClick}>
    {`Approve ${props.token}`}
  </Button>
);

const NewPoolWarning = (props: { inputA: string; inputB: string; tokenA: string; tokenB: string }) => {
  return (
    <div
      style={{
        display: 'flex',
        paddingTop: '0.5rem',
      }}
    >
      <Message warning style={{ borderRadius: '20px' }}>
        <Message.Header>Pair without liquidity!</Message.Header>
        <p>This trading pair has no liquidity. By providing liquidity you are setting the price.</p>
        {(() => {
          const newPrice = new BigNumber(props.inputA).dividedBy(props.inputB);

          return newPrice.isNaN() ? null : (
            <PriceRow fromToken={props.tokenA} toToken={props.tokenB} price={newPrice.toNumber()} labelPrefix="New " />
          );
        })()}
      </Message>
    </div>
  );
};

import React from 'react';
import { SigningCosmWasmClient } from 'secretjs';
import { Button, Container, Message } from 'semantic-ui-react';
import {
  mulDecimals,
  UINT128_MAX,
  sortedStringify,
  humanizeBalance,
  displayHumanizedBalance,
  canonicalizeBalance,
} from 'utils';
import { flexRowSpace, Pair, swapContainerStyle, TokenDisplay } from '.';
import { AssetRow } from './AssetRow';
import { TabsHeader } from './TabsHeader';
import { PriceRow } from './PriceRow';
import { UserStoreEx } from 'stores/UserStore';
import { Coin } from 'secretjs/types/types';
import BigNumber from 'bignumber.js';
import ScrtTokenBalanceSingleLine from 'components/Earn/EarnRow/ScrtTokenBalanceSingleLine';

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

const BUTTON_MSG_ENTER_AMOUNT = 'Enter an amount';
const BUTTON_MSG_NO_TRADNIG_PAIR = 'Trading pair does not exist';
const BUTTON_MSG_LOADING_PRICE = 'Loading price data';
const BUTTON_MSG_PROVIDE = 'Provide';

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
    if (
      sortedStringify(previousProps.balances) !==
      sortedStringify(this.props.balances)
    ) {
      this.updateInputs();
    }

    if (
      sortedStringify(previousProps.pairFromSymbol) !==
      sortedStringify(this.props.pairFromSymbol)
    ) {
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
      console.error('updateAllowance for non-existant pair');
      return;
    }

    const result: {
      allowance: {
        owner: string;
        spender: string;
        allowance: string;
        expiration: number;
      };
    } = await this.props.secretjs.queryContractSmart(
      this.props.tokens[symbol].address,
      {
        allowance: {
          owner: this.props.user.address,
          spender: pair.contract_addr,
          key: 'SecretSwap',
        },
      },
    );

    let allowance = new BigNumber(result.allowance.allowance);
    if (allowance.isNaN()) {
      allowance = new BigNumber(0);
    }

    console.log(
      `Allowance for ${symbol} is ${allowance} (${result.allowance.allowance})`,
    );

    this.setState<never>({ [stateField]: allowance });
  }

  async updateInputs() {
    const selectedPairSymbol = `${this.state.tokenA}/${this.state.tokenB}`;
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

    const decimalsA = this.props.tokens[this.state.tokenA].decimals;
    const decimalsB = this.props.tokens[this.state.tokenB].decimals;

    const humanPoolA = humanizeBalance(
      new BigNumber(
        this.props.balances[
          `${this.state.tokenA}-${selectedPairSymbol}`
        ] as any,
      ),
      decimalsA,
    );
    const humanPoolB = humanizeBalance(
      new BigNumber(
        this.props.balances[
          `${this.state.tokenB}-${selectedPairSymbol}`
        ] as any,
      ),
      decimalsB,
    );

    if (
      humanPoolA.isNaN() ||
      humanPoolB.isNaN() ||
      humanPoolA.isEqualTo(0) ||
      humanPoolB.isEqualTo(0)
    ) {
      return;
    }

    if (this.state.isEstimatedB) {
      // inputB/inputA = poolB/poolA
      // =>
      // inputB = inputA*(poolB/poolA)
      const inputB =
        Number(this.state.inputA) * humanPoolB.dividedBy(humanPoolA).toNumber();

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
      const inputA =
        Number(this.state.inputB) * humanPoolA.dividedBy(humanPoolB).toNumber();

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
      await this.props.secretjs.execute(this.props.tokens[symbol].address, {
        increase_allowance: {
          spender: pair.contract_addr,
          amount: UINT128_MAX,
        },
      });
      this.setState<never>({
        [`allowance${stateFieldSuffix}`]: Infinity,
      });
    } catch (error) {
      console.error('Error while trying to approve', symbol, error);
    }

    this.setState<never>({
      [`loadingApprove${stateFieldSuffix}`]: false,
    });
  }

  render() {
    const selectedPairSymbol = `${this.state.tokenA}/${this.state.tokenB}`;
    const pair = this.props.pairFromSymbol[selectedPairSymbol];

    const [balanceA, balanceB] = [
      this.props.balances[this.state.tokenA],
      this.props.balances[this.state.tokenB],
    ];

    const decimalsA = this.props.tokens[this.state.tokenA]?.decimals;
    const decimalsB = this.props.tokens[this.state.tokenB]?.decimals;

    const poolA = new BigNumber(
      this.props.balances[
        `${this.state.tokenA}-${selectedPairSymbol}`
      ] as BigNumber,
    );
    const poolB = new BigNumber(
      this.props.balances[
        `${this.state.tokenB}-${selectedPairSymbol}`
      ] as BigNumber,
    );

    const price = humanizeBalance(poolA, decimalsA).dividedBy(
      humanizeBalance(poolB, decimalsB),
    );

    let buttonMessage: string;
    if (!pair) {
      buttonMessage = BUTTON_MSG_NO_TRADNIG_PAIR;
    } else if (this.state.inputA === '' || this.state.inputB === '') {
      buttonMessage = BUTTON_MSG_ENTER_AMOUNT;
    } else if (
      humanizeBalance(new BigNumber(balanceA as any), decimalsA).isLessThan(
        new BigNumber(this.state.inputA),
      )
    ) {
      buttonMessage = `Insufficient ${this.state.tokenA} balance`;
    } else if (
      humanizeBalance(new BigNumber(balanceB as any), decimalsB).isLessThan(
        new BigNumber(this.state.inputB),
      )
    ) {
      buttonMessage = `Insufficient ${this.state.tokenB} balance`;
    } else if (poolA.isZero() || poolB.isZero()) {
      buttonMessage = BUTTON_MSG_PROVIDE;
    } else if (price.isNaN()) {
      buttonMessage = BUTTON_MSG_LOADING_PRICE;
    } else {
      buttonMessage = BUTTON_MSG_PROVIDE;
    }

    const amountA = canonicalizeBalance(
      new BigNumber(this.state.inputA),
      decimalsA,
    );
    const amountB = canonicalizeBalance(
      new BigNumber(this.state.inputB),
      decimalsB,
    );

    const allowanceA = new BigNumber(this.state.allowanceA);
    const allowanceB = new BigNumber(this.state.allowanceB);

    const showApproveAButton: boolean =
      this.state.tokenA !== 'SCRT' && pair && allowanceA.lt(amountA);
    const showApproveBButton: boolean =
      this.state.tokenB !== 'SCRT' && pair && allowanceB.lt(amountB);

    const lpTokenBalance = this.props.balances[`LP-${selectedPairSymbol}`];
    const lpTokenTotalSupply = new BigNumber(
      this.props.balances[`LP-${selectedPairSymbol}-total-supply`] as BigNumber,
    );
    const currentShareOfPool = lpTokenTotalSupply.isZero()
      ? lpTokenTotalSupply
      : new BigNumber(lpTokenBalance as BigNumber).dividedBy(
          lpTokenTotalSupply,
        );

    const gainedShareOfPool = BigNumber.minimum(
      amountA.dividedBy(poolA.plus(amountA)),
      amountB.dividedBy(poolB.plus(amountB)),
    );

    return (
      <Container style={swapContainerStyle}>
        <TabsHeader />
        <AssetRow
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
                  this.updateAllowance(
                    this.props.pairFromSymbol[
                      `${this.state.tokenA}/${this.state.tokenB}`
                    ],
                    symbol,
                  );
                },
              );
            }
          }}
          amount={this.state.inputA}
          isEstimated={false}
          setAmount={(value: string) => {
            if (value === '' || Number(value) === 0) {
              this.setState({
                inputA: value,
                isEstimatedA: false,
                inputB: '',
                isEstimatedB: false,
              });
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
            flexDirection: 'row',
            alignContent: 'center',
          }}
        >
          {flexRowSpace}
          <span>{plus}</span>
          {flexRowSpace}
        </div>
        <AssetRow
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
                  this.updateAllowance(
                    this.props.pairFromSymbol[
                      `${this.state.tokenA}/${this.state.tokenB}`
                    ],
                    symbol,
                  );
                },
              );
            }
          }}
          amount={this.state.inputB}
          isEstimated={false}
          setAmount={(value: string) => {
            if (value === '' || Number(value) === 0) {
              this.setState({
                inputA: '',
                isEstimatedA: false,
                inputB: value,
                isEstimatedB: false,
              });
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
        {(poolA.isZero() || poolB.isZero()) &&
          !poolA.isNaN() &&
          !poolB.isNaN() && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                paddingTop: '0.5rem',
              }}
            >
              <Message warning style={{ borderRadius: '20px' }}>
                <Message.Header>Pair without liquidiy!</Message.Header>
                <p>
                  This trading pair has no liquidiy. By providing liquidity you
                  are setting the price.
                </p>
                <p>
                  Current liquidity in {this.state.tokenA} Pool:{' '}
                  {displayHumanizedBalance(humanizeBalance(poolA, decimalsA))}
                </p>
                <p>
                  Current liquidity in {this.state.tokenB} Pool:{' '}
                  {displayHumanizedBalance(humanizeBalance(poolB, decimalsB))}
                </p>
                {(() => {
                  const newPrice = new BigNumber(this.state.inputA)
                    .plus(humanizeBalance(poolA, decimalsA))
                    .dividedBy(
                      new BigNumber(this.state.inputB).plus(
                        humanizeBalance(poolB, decimalsB),
                      ),
                    );

                  return newPrice.isNaN() ? null : (
                    <PriceRow
                      fromToken={this.state.tokenA}
                      toToken={this.state.tokenB}
                      price={newPrice.toNumber()}
                      labelPrefix="New "
                    />
                  );
                })()}
              </Message>
            </div>
          )}
        {!price.isNaN() && (
          <PriceRow
            fromToken={this.state.tokenA}
            toToken={this.state.tokenB}
            price={price.toNumber()}
          />
        )}
        {lpTokenBalance !== undefined && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
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
              flexDirection: 'row',
              paddingTop: '0.5rem',
            }}
          >
            Expected Gain in Your Share of Pool
            {flexRowSpace}
            {`~${gainedShareOfPool.multipliedBy(100).toFixed(2)}%`}
          </div>
        )}
        {showApproveAButton && (
          <Button
            disabled={this.state.loadingApproveA}
            loading={this.state.loadingApproveA}
            primary
            fluid
            style={buttonStyle}
            onClick={() => {
              this.approveOnClick(pair, this.state.tokenA);
            }}
          >
            {`Approve ${this.state.tokenA}`}
          </Button>
        )}
        {showApproveBButton && (
          <Button
            disabled={this.state.loadingApproveB}
            loading={this.state.loadingApproveB}
            primary
            fluid
            style={buttonStyle}
            onClick={() => {
              this.approveOnClick(pair, this.state.tokenB);
            }}
          >
            {`Approve ${this.state.tokenB}`}
          </Button>
        )}
        <Button
          disabled={
            buttonMessage !== BUTTON_MSG_PROVIDE ||
            this.state.loadingProvide ||
            showApproveAButton ||
            showApproveBButton
          }
          loading={this.state.loadingProvide}
          primary={
            buttonMessage === BUTTON_MSG_PROVIDE &&
            !showApproveAButton &&
            !showApproveBButton
          }
          fluid
          style={buttonStyle}
          onClick={async () => {
            this.setState({
              loadingProvide: true,
            });

            const msg = {
              provide_liquidity: {
                assets: [],
              },
            };

            let transferAmount: Array<Coin> = undefined;
            for (const i of ['A', 'B']) {
              const { decimals } = this.props.tokens[this.state['token' + i]];
              const nf = new Intl.NumberFormat('en-US', {
                maximumFractionDigits: decimals,
                useGrouping: false,
              });

              const amount: string = mulDecimals(
                nf.format(this.state['input' + i]),
                decimals,
              ).toString();

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

            try {
              const x = await this.props.secretjs.execute(
                pair.contract_addr,
                msg,
                '',
                transferAmount,
              );
              this.setState({
                inputA: '',
                inputB: '',
                isEstimatedA: false,
                isEstimatedB: false,
              });
            } catch (error) {
              console.error('Error while trying to add liquidity', error);
            }

            this.setState({
              loadingProvide: false,
            });
          }}
        >
          {buttonMessage}
        </Button>
      </Container>
    );
  }
}

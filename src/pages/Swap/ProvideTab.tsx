import React from 'react';
import { SigningCosmWasmClient } from 'secretjs';
import { Button, Container } from 'semantic-ui-react';
import { divDecimals, mulDecimals, UINT128_MAX, sortedStringify } from 'utils';
import { flexRowSpace, Pair, swapContainerStyle, TokenDisplay } from '.';
import { AssetRow } from './AssetRow';
import { TabsHeader } from './TabsHeader';
import { PriceRow } from './PriceRow';
import { UserStoreEx } from 'stores/UserStore';
import { Coin } from 'secretjs/types/types';

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
      [symbol: string]: number | JSX.Element;
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
    allowanceA: number;
    allowanceB: number;
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
      allowanceA: 0,
      allowanceB: 0,
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
      this.setState<never>({ [stateField]: Infinity });
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

    let allowance = Number(
      divDecimals(
        result.allowance.allowance,
        this.props.tokens[symbol].decimals,
      ),
    );
    if (isNaN(allowance)) {
      allowance = 0;
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

    const poolA = Number(
      this.props.balances[`${this.state.tokenA}-${selectedPairSymbol}`],
    );
    const poolB = Number(
      this.props.balances[`${this.state.tokenB}-${selectedPairSymbol}`],
    );

    if (isNaN(poolA) || isNaN(poolB) || poolA === 0 || poolB === 0) {
      return;
    }

    if (this.state.isEstimatedB) {
      // inputB/inputA = poolB/poolA
      // =>
      // inputB = inputA*(poolB/poolA)
      const inputB = Number(this.state.inputA) * (poolB / poolA);

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
      const inputA = Number(this.state.inputB) * (poolA / poolB);

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
      this.setState<never>({ [`allowance${stateFieldSuffix}`]: Infinity });
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

    const poolA = Number(
      this.props.balances[`${this.state.tokenA}-${selectedPairSymbol}`],
    );
    const poolB = Number(
      this.props.balances[`${this.state.tokenB}-${selectedPairSymbol}`],
    );
    const price = poolB / poolA;

    let buttonMessage: string;
    if (!pair) {
      buttonMessage = BUTTON_MSG_NO_TRADNIG_PAIR;
    } else if (this.state.inputA === '' && this.state.inputB === '') {
      buttonMessage = BUTTON_MSG_ENTER_AMOUNT;
    } else if (Number(balanceA) < Number(this.state.inputA)) {
      buttonMessage = `Insufficient ${this.state.tokenA} balance`;
    } else if (Number(balanceB) < Number(this.state.inputB)) {
      buttonMessage = `Insufficient ${this.state.tokenB} balance`;
    } else if (isNaN(price)) {
      buttonMessage = BUTTON_MSG_LOADING_PRICE;
    } else {
      buttonMessage = BUTTON_MSG_PROVIDE;
    }

    const amountA = Number(this.state.inputA);
    const amountB = Number(this.state.inputB);

    const showApproveAButton: boolean =
      this.state.tokenA !== 'SCRT' && pair && this.state.allowanceA < amountA;
    const showApproveBButton: boolean =
      this.state.tokenB !== 'SCRT' && pair && this.state.allowanceB < amountB;

    const lpTokenBalance = this.props.balances[`LP-${selectedPairSymbol}`];
    const lpTokenTotalSupply = this.props.balances[
      `LP-${selectedPairSymbol}-total-supply`
    ];
    const currentShareOfPool =
      Number(lpTokenBalance) / Number(lpTokenTotalSupply);

    const gainedShareOfPool = Math.min(
      amountA / (poolA + amountA),
      amountB / (poolB + amountB),
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
        {!isNaN(price) && (
          <PriceRow
            fromToken={this.state.tokenA}
            toToken={this.state.tokenB}
            price={price}
          />
        )}
        {lpTokenBalance && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              paddingTop: '0.5rem',
            }}
          >
            Current Share of Pool
            {flexRowSpace}
            {isNaN(currentShareOfPool)
              ? lpTokenBalance
              : `${new Intl.NumberFormat('en-US', {
                  maximumFractionDigits: 2,
                  useGrouping: false,
                }).format(currentShareOfPool * 100)}%`}
          </div>
        )}
        {gainedShareOfPool > 0 && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              paddingTop: '0.5rem',
            }}
          >
            Gained Share of Pool
            {flexRowSpace}
            {`~${new Intl.NumberFormat('en-US', {
              maximumFractionDigits: 2,
              useGrouping: false,
            }).format(gainedShareOfPool * 100)}%`}
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
              console.log(x);
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

import React from 'react';
import { Button, Container } from 'semantic-ui-react';
import './override.css';
import { canonicalizeBalance, displayHumanizedBalance, humanizeBalance, sortedStringify } from 'utils';
import { AssetRow } from './AssetRow';
import { AdditionalInfo } from './AdditionalInfo';
import { PriceRow } from './PriceRow';
import { compute_swap, compute_offer_amount } from '../../blockchain-bridge/scrt/swap';
import { SigningCosmWasmClient } from 'secretjs';
import { TabsHeader } from './TabsHeader';
import { flexRowSpace, Pair, swapContainerStyle, TokenDisplay } from '.';
import { BigNumber } from 'bignumber.js';
import { extractValueFromLogs, getFeeForExecute } from '../../blockchain-bridge/scrt';

export const downArrow = (
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
    <polyline points="19 12 12 19 5 12"></polyline>
  </svg>
);

const BUTTON_MSG_ENTER_AMOUNT = 'Enter an amount';
const BUTTON_MSG_NO_TRADNIG_PAIR = 'Trading pair does not exist';
const BUTTON_MSG_LOADING_PRICE = 'Loading price data';
const BUTTON_MSG_NOT_ENOUGH_LIQUIDITY = 'Insufficient liquidity for this trade';
const BUTTON_MSG_SWAP = 'Swap';

export class SwapTab extends React.Component<
  {
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
    fromToken: string;
    toToken: string;
    fromInput: string;
    toInput: string;
    isFromEstimated: boolean;
    isToEstimated: boolean;
    spread: number;
    commission: number;
    priceImpact: number;
    slippageTolerance: BigNumber;
    buttonMessage: string;
    loadingSwap: boolean;
  }
> {
  constructor(props) {
    super(props);

    this.state = {
      fromToken: Object.keys(this.props.tokens)[0] || '',
      toToken: Object.keys(this.props.tokens)[1] || '',
      fromInput: '',
      toInput: '',
      isFromEstimated: false,
      isToEstimated: false,
      spread: 0,
      commission: 0,
      priceImpact: 0,
      slippageTolerance: new BigNumber(0.5 / 100),
      buttonMessage: BUTTON_MSG_ENTER_AMOUNT,
      loadingSwap: false,
    };
  }

  componentDidUpdate(previousProps) {
    if (sortedStringify(previousProps.balances) !== sortedStringify(this.props.balances)) {
      this.updateInputs();
    }

    if (sortedStringify(previousProps.tokens) !== sortedStringify(this.props.tokens)) {
      const fromToken = Object.keys(this.props.tokens)[0];
      const toToken = Object.keys(this.props.tokens)[1];

      this.setState({
        fromToken,
        toToken,
      });
    }
  }

  async updateInputs() {
    const selectedPairSymbol = `${this.state.fromToken}/${this.state.toToken}`;
    const pair = this.props.pairFromSymbol[selectedPairSymbol];
    if (!pair) {
      this.setState({
        fromInput: '',
        isFromEstimated: false,
        toInput: '',
        isToEstimated: false,
      });
      return;
    }

    const fromDecimals = this.props.tokens[this.state.fromToken].decimals;
    const toDecimals = this.props.tokens[this.state.toToken].decimals;

    // we normalize offer_pool & ask_pool
    // we could also canonicalize offer_amount & ask_amount
    // but this way is less code because we get the results normilized
    const offer_pool = humanizeBalance(
      new BigNumber(this.props.balances[`${this.state.fromToken}-${selectedPairSymbol}`] as any),
      fromDecimals,
    );
    const ask_pool = humanizeBalance(
      new BigNumber(this.props.balances[`${this.state.toToken}-${selectedPairSymbol}`] as any),
      toDecimals,
    );

    if (offer_pool.isNaN() || ask_pool.isNaN() || offer_pool.isEqualTo(0) || ask_pool.isEqualTo(0)) {
      return;
    }

    if (this.state.isToEstimated) {
      const offer_amount = new BigNumber(this.state.fromInput);

      const { return_amount, spread_amount, commission_amount } = compute_swap(offer_pool, ask_pool, offer_amount);

      if (return_amount.isNaN() || this.state.fromInput === '') {
        this.setState({
          isFromEstimated: false,
          toInput: '',
          isToEstimated: false,
          spread: 0,
          commission: 0,
          priceImpact: 0,
        });
      } else {
        this.setState({
          isFromEstimated: false,
          toInput: return_amount.isLessThan(0) ? '' : return_amount.toFixed(toDecimals),
          isToEstimated: return_amount.isGreaterThanOrEqualTo(0),
          spread: spread_amount.toNumber(),
          commission: commission_amount.toNumber(),
          priceImpact: spread_amount.dividedBy(return_amount).toNumber(),
        });
      }
    } else if (this.state.isFromEstimated) {
      const ask_amount = new BigNumber(this.state.toInput);

      const { offer_amount, spread_amount, commission_amount } = compute_offer_amount(offer_pool, ask_pool, ask_amount);

      if (offer_amount.isNaN() || this.state.toInput === '') {
        this.setState({
          isToEstimated: false,
          fromInput: '',
          isFromEstimated: false,
          spread: 0,
          commission: 0,
          priceImpact: 0,
        });
      } else {
        this.setState({
          isToEstimated: false,
          fromInput: offer_amount.isLessThan(0) ? '' : offer_amount.toFixed(fromDecimals),
          isFromEstimated: offer_amount.isGreaterThanOrEqualTo(0),
          spread: spread_amount.toNumber(),
          commission: commission_amount.toNumber(),
          priceImpact: spread_amount.dividedBy(offer_amount).toNumber(),
        });
      }
    }
  }

  render() {
    const selectedPairSymbol = `${this.state.fromToken}/${this.state.toToken}`;
    const pair = this.props.pairFromSymbol[selectedPairSymbol];

    const ask_pool = new BigNumber(this.props.balances[`${this.state.toToken}-${selectedPairSymbol}`] as BigNumber);
    const [fromBalance, toBalance] = [
      this.props.balances[this.state.fromToken],
      this.props.balances[this.state.toToken],
    ];

    const [fromDecimals, toDecimals] = [
      this.props.tokens[this.state.fromToken]?.decimals,
      this.props.tokens[this.state.toToken]?.decimals,
    ];

    const canonFromInput = canonicalizeBalance(new BigNumber(this.state.fromInput), fromDecimals);
    const canonToInput = canonicalizeBalance(new BigNumber(this.state.toInput), toDecimals);

    let buttonMessage: string;
    if (!pair) {
      buttonMessage = BUTTON_MSG_NO_TRADNIG_PAIR;
    } else if (this.state.fromInput === '' && this.state.toInput === '') {
      buttonMessage = BUTTON_MSG_ENTER_AMOUNT;
    } else if (new BigNumber(fromBalance as BigNumber).isLessThan(canonFromInput)) {
      buttonMessage = `Insufficient ${this.state.fromToken} balance`;
    } else if (ask_pool.isLessThan(canonToInput)) {
      buttonMessage = BUTTON_MSG_NOT_ENOUGH_LIQUIDITY;
    } else if (this.state.fromInput === '' || this.state.toInput === '') {
      buttonMessage = BUTTON_MSG_LOADING_PRICE;
    } else {
      buttonMessage = BUTTON_MSG_SWAP;
    }

    const hidePriceRow: boolean =
      this.state.toInput === '' ||
      this.state.fromInput === '' ||
      isNaN(Number(this.state.toInput) / Number(this.state.fromInput)) ||
      this.state.buttonMessage === BUTTON_MSG_LOADING_PRICE ||
      this.state.buttonMessage === BUTTON_MSG_NOT_ENOUGH_LIQUIDITY ||
      this.state.buttonMessage === BUTTON_MSG_NO_TRADNIG_PAIR;

    return (
      <>
        <Container style={swapContainerStyle}>
          <TabsHeader />
          <AssetRow
            secretjs={this.props.secretjs}
            label="From"
            maxButton={true}
            balance={fromBalance}
            tokens={this.props.tokens}
            token={this.state.fromToken}
            setToken={(symbol: string) => {
              if (symbol === this.state.toToken) {
                // switch
                this.setState(
                  {
                    fromToken: symbol,
                    toToken: this.state.fromToken,
                    isFromEstimated: this.state.isToEstimated,
                    isToEstimated: this.state.isFromEstimated,
                    fromInput: this.state.toInput,
                    toInput: this.state.fromInput,
                  },
                  () => this.updateInputs(),
                );
              } else {
                this.setState(
                  {
                    fromToken: symbol,
                    fromInput: '',
                    isFromEstimated: true,
                    isToEstimated: false,
                  },
                  () => this.updateInputs(),
                );
              }
            }}
            amount={this.state.fromInput}
            isEstimated={
              false /* Eventually From is the exact amount that will be sent, so even if we estimate it in updateInputs we don't show the "(estimated)" label to the user */
            }
            setAmount={(value: string) => {
              if (value === '' || Number(value) === 0) {
                this.setState({
                  fromInput: value,
                  isFromEstimated: false,
                  toInput: '',
                  isToEstimated: false,
                  spread: 0,
                  commission: 0,
                  priceImpact: 0,
                });
                return;
              }

              this.setState(
                {
                  fromInput: value,
                  isFromEstimated: false,
                  isToEstimated: true,
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
            <span
              style={{ cursor: 'pointer' }}
              onClick={() => {
                this.setState(
                  {
                    toToken: this.state.fromToken,
                    toInput: this.state.fromInput,
                    isToEstimated: this.state.isFromEstimated,

                    fromToken: this.state.toToken,
                    fromInput: this.state.toInput,
                    isFromEstimated: this.state.isToEstimated,
                  },
                  () => this.updateInputs(),
                );
              }}
            >
              {downArrow}
            </span>
            {flexRowSpace}
          </div>
          <AssetRow
            secretjs={this.props.secretjs}
            label="To"
            maxButton={false}
            balance={toBalance}
            tokens={this.props.tokens}
            token={this.state.toToken}
            setToken={(symbol: string) => {
              if (symbol === this.state.fromToken) {
                // switch
                this.setState(
                  {
                    toToken: symbol,
                    fromToken: this.state.toToken,
                    isFromEstimated: this.state.isToEstimated,
                    isToEstimated: this.state.isFromEstimated,
                    fromInput: this.state.toInput,
                    toInput: this.state.fromInput,
                  },
                  () => this.updateInputs(),
                );
              } else {
                this.setState(
                  {
                    toToken: symbol,
                    toInput: '',
                    isToEstimated: true,
                    isFromEstimated: false,
                  },
                  () => this.updateInputs(),
                );
              }
            }}
            amount={this.state.toInput}
            isEstimated={this.state.toInput !== '' /* this.state.isToEstimated */}
            setAmount={(value: string) => {
              if (value === '' || Number(value) === 0) {
                this.setState({
                  toInput: value,
                  isToEstimated: false,
                  fromInput: '',
                  isFromEstimated: false,
                  spread: 0,
                  commission: 0,
                  priceImpact: 0,
                });
                return;
              }

              this.setState(
                {
                  toInput: value,
                  isToEstimated: false,
                  isFromEstimated: true,
                },
                () => this.updateInputs(),
              );
            }}
          />
          {!hidePriceRow && (
            <PriceRow
              toToken={this.state.toToken}
              fromToken={this.state.fromToken}
              price={Number(this.state.fromInput) / Number(this.state.toInput)}
            />
          )}
          <Button
            disabled={buttonMessage !== BUTTON_MSG_SWAP || this.state.loadingSwap}
            loading={this.state.loadingSwap}
            primary={buttonMessage === BUTTON_MSG_SWAP}
            fluid
            style={{
              margin: '1em 0 0 0',
              borderRadius: '12px',
              padding: '18px',
              fontSize: '20px',
            }}
            onClick={async () => {
              if (this.state.priceImpact >= 0.15) {
                const confirmString = 'confirm';
                const confirm = prompt(
                  `Price impact for this swap is very high. Please type the word "${confirmString}" to continue.`,
                );
                if (confirm !== confirmString) {
                  return;
                }
              }

              this.setState({ loadingSwap: true });
              const { fromInput, toInput, fromToken, toToken } = this.state;
              const pair = this.props.pairFromSymbol[`${this.state.fromToken}/${this.state.toToken}`];

              try {
                const { decimals } = this.props.tokens[this.state.fromToken];
                const fromAmount = canonicalizeBalance(new BigNumber(this.state.fromInput), decimals).toFixed(
                  0,
                  BigNumber.ROUND_DOWN,
                  /*
                  should be 0 fraction digits because of canonicalizeBalance,
                  but to be sure we're rounding down to prevent over-spending
                  */
                );

                // offer_amount: exactly how much we're sending
                // ask_amount: roughly how much we're getting
                // expected_return: at least ask_amount minus some slippage

                const ask_amount = canonToInput;
                const expected_return = ask_amount
                  .multipliedBy(new BigNumber(1).minus(this.state.slippageTolerance))
                  .toFormat(0, { groupSeparator: '' });

                if (this.state.fromToken === 'SCRT') {
                  const result = await this.props.secretjs.execute(
                    pair.contract_addr,
                    {
                      swap: {
                        offer_asset: {
                          info: { native_token: { denom: 'uscrt' } },
                          amount: fromAmount,
                        },
                        expected_return,
                        // offer_asset: Asset,
                        // expected_return: Option<Uint128>
                        // belief_price: Option<Decimal>,
                        // max_spread: Option<Decimal>,
                        // to: Option<HumanAddr>, // TODO
                      },
                    },
                    '',
                    [
                      {
                        amount: fromAmount,
                        denom: 'uscrt',
                      },
                    ],
                    getFeeForExecute(500_000),
                  );

                  const sent = humanizeBalance(
                    new BigNumber(extractValueFromLogs(result, 'offer_amount')),
                    fromDecimals,
                  ).toFixed();
                  const received = humanizeBalance(
                    new BigNumber(extractValueFromLogs(result, 'return_amount')),
                    toDecimals,
                  ).toFixed();

                  this.props.notify('success', `Swapped ${sent} ${fromToken} for ${received} ${toToken}`);
                } else {
                  const result = await this.props.secretjs.execute(
                    this.props.tokens[this.state.fromToken].address,
                    {
                      send: {
                        recipient: pair.contract_addr,
                        amount: fromAmount,
                        msg: btoa(
                          JSON.stringify({
                            swap: {
                              expected_return,
                              // expected_return: Option<Uint128>
                              // belief_price: Option<Decimal>,
                              // max_spread: Option<Decimal>,
                              // to: Option<HumanAddr>, // TODO
                            },
                          }),
                        ),
                      },
                    },
                    '',
                    [],
                    getFeeForExecute(500_000),
                  );
                  const sent = humanizeBalance(
                    new BigNumber(extractValueFromLogs(result, 'offer_amount')),
                    fromDecimals,
                  ).toFixed();
                  const received = humanizeBalance(
                    new BigNumber(extractValueFromLogs(result, 'return_amount')),
                    toDecimals,
                  ).toFixed();

                  this.props.notify('success', `Swapped ${sent} ${fromToken} for ${received} ${toToken}`);
                }
              } catch (error) {
                console.error('Swap error', error);
                this.props.notify('error', `Error swapping ${fromInput} ${fromToken} for ${toToken}: ${error.message}`);
                this.setState({
                  loadingSwap: false,
                });
                return;
              }

              this.setState({
                loadingSwap: false,
                toInput: '',
                fromInput: '',
                isFromEstimated: false,
                isToEstimated: false,
              });
            }}
          >
            {buttonMessage}
          </Button>
        </Container>
        {!hidePriceRow && (
          <AdditionalInfo
            fromToken={this.state.fromToken}
            toToken={this.state.toToken}
            liquidityProviderFee={this.state.commission}
            priceImpact={this.state.priceImpact}
            minimumReceived={new BigNumber(this.state.toInput).multipliedBy(
              new BigNumber(1).minus(this.state.slippageTolerance),
            )}
            /*
            maximumSold={
              this.state.isFromEstimated
                ? Number(this.state.fromInput) *
                  (1 + this.state.slippageTolerance)
                : null
            }
            */
          />
        )}
      </>
    );
  }
}

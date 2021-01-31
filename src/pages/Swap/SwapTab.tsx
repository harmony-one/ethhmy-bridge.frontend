import React from 'react';
import { Button, Container } from 'semantic-ui-react';
import './override.css';
import { beliefPriceNumberFormat, mulDecimals, sortedStringify } from 'utils';
import { AssetRow } from './AssetRow';
import { AdditionalInfo } from './AdditionalInfo';
import { PriceRow } from './PriceRow';
import {
  compute_swap,
  compute_offer_amount,
  reverse_decimal,
} from '../../blockchain-bridge/scrt/swap';
import { SigningCosmWasmClient } from 'secretjs';
import { TabsHeader } from './TabsHeader';
import { flexRowSpace, Pair, swapContainerStyle, TokenDisplay } from '.';

const downArrow = (
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
      [symbol: string]: number | JSX.Element;
    };
    pairs: Array<Pair>;
    pairFromSymbol: {
      [symbol: string]: Pair;
    };
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
    slippageTolerance: number;
    buttonMessage: string;
    loadingSwap: boolean;
  }
> {
  constructor(props) {
    super(props);

    this.state = {
      fromToken: Object.keys(this.props.tokens)[1] || '',
      toToken: Object.keys(this.props.tokens)[0] || '',
      fromInput: '',
      toInput: '',
      isFromEstimated: false,
      isToEstimated: false,
      spread: 0,
      commission: 0,
      priceImpact: 0,
      slippageTolerance: 0.005,
      buttonMessage: BUTTON_MSG_ENTER_AMOUNT,
      loadingSwap: false,
    };
  }

  componentDidUpdate(previousProps) {
    if (
      sortedStringify(previousProps.balances) !==
      sortedStringify(this.props.balances)
    ) {
      this.updateInputs();
    }

    if (
      sortedStringify(previousProps.tokens) !==
      sortedStringify(this.props.tokens)
    ) {
      const fromToken = Object.keys(this.props.tokens)[1];
      const toToken = Object.keys(this.props.tokens)[0];

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

    const offer_pool = Number(
      this.props.balances[`${this.state.fromToken}-${selectedPairSymbol}`],
    );
    const ask_pool = Number(
      this.props.balances[`${this.state.toToken}-${selectedPairSymbol}`],
    );

    if (
      isNaN(offer_pool) ||
      isNaN(ask_pool) ||
      offer_pool === 0 ||
      ask_pool === 0
    ) {
      return;
    }

    if (this.state.isToEstimated) {
      const offer_amount = Number(this.state.fromInput);

      const { return_amount, spread_amount, commission_amount } = compute_swap(
        offer_pool,
        ask_pool,
        offer_amount,
      );

      if (isNaN(return_amount) || this.state.fromInput === '') {
        this.setState({
          isFromEstimated: false,
          toInput: '',
          isToEstimated: false,
          spread: 0,
          commission: 0,
          priceImpact: 0,
        });
      } else {
        const nf = new Intl.NumberFormat('en-US', {
          maximumFractionDigits: this.props.tokens[this.state.toToken].decimals,
          useGrouping: false,
        });
        this.setState({
          isFromEstimated: false,
          toInput: return_amount < 0 ? '' : nf.format(return_amount),
          isToEstimated: return_amount >= 0,
          spread: spread_amount,
          commission: commission_amount,
          priceImpact: spread_amount / return_amount,
        });
      }
    } else if (this.state.isFromEstimated) {
      const ask_amount = Number(this.state.toInput);

      const {
        offer_amount,
        spread_amount,
        commission_amount,
      } = compute_offer_amount(offer_pool, ask_pool, ask_amount);

      if (isNaN(offer_amount) || this.state.toInput === '') {
        this.setState({
          isToEstimated: false,
          fromInput: '',
          isFromEstimated: false,
          spread: 0,
          commission: 0,
          priceImpact: 0,
        });
      } else {
        const nf = new Intl.NumberFormat('en-US', {
          maximumFractionDigits: this.props.tokens[this.state.fromToken]
            .decimals,
          useGrouping: false,
        });
        this.setState({
          isToEstimated: false,
          fromInput: offer_amount < 0 ? '' : nf.format(offer_amount),
          isFromEstimated: offer_amount >= 0,
          spread: spread_amount,
          commission: commission_amount,
          priceImpact: spread_amount / offer_amount,
        });
      }
    }
  }

  render() {
    const selectedPairSymbol = `${this.state.fromToken}/${this.state.toToken}`;
    const pair = this.props.pairFromSymbol[selectedPairSymbol];
    const offer_pool = Number(
      this.props.balances[`${this.state.fromToken}-${selectedPairSymbol}`],
    );
    const ask_pool = Number(
      this.props.balances[`${this.state.toToken}-${selectedPairSymbol}`],
    );
    const [fromBalance, toBalance] = [
      this.props.balances[this.state.fromToken],
      this.props.balances[this.state.toToken],
    ];

    let buttonMessage: string;
    if (!pair) {
      buttonMessage = BUTTON_MSG_NO_TRADNIG_PAIR;
    } else if (this.state.fromInput === '' && this.state.toInput === '') {
      buttonMessage = BUTTON_MSG_ENTER_AMOUNT;
    } else if (Number(fromBalance) < Number(this.state.fromInput)) {
      buttonMessage = `Insufficient ${this.state.fromToken} balance`;
    } else if (
      this.state.priceImpact >= 1 ||
      this.state.priceImpact < 0 ||
      offer_pool === 0 ||
      ask_pool === 0 ||
      Number(this.state.toInput) > ask_pool
    ) {
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
              flexDirection: 'row',
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
            isEstimated={
              this.state.toInput !== '' /* this.state.isToEstimated */
            }
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
              price={Number(this.state.toInput) / Number(this.state.fromInput)}
            />
          )}
          <Button
            disabled={
              buttonMessage !== BUTTON_MSG_SWAP || this.state.loadingSwap
            }
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

              try {
                const pair = this.props.pairFromSymbol[
                  `${this.state.fromToken}/${this.state.toToken}`
                ];

                const { decimals } = this.props.tokens[this.state.fromToken];
                const nf = new Intl.NumberFormat('en-US', {
                  maximumFractionDigits: decimals,
                  useGrouping: false,
                });

                const amountInTokenDenom = mulDecimals(
                  nf.format(Number(this.state.fromInput)),
                  decimals,
                ).toString();

                // offer_amount: exactly how much we're sending
                // ask_amount: roughly how much we're getting
                // expected_return: at least ask_amount minus some slippage
                // belief_price: calculated from this line https://github.com/enigmampc/SecretSwap/blob/6135f0/contracts/secretswap_pair/src/contract.rs#L674
                // max_spread: always zero, because we want this condition to always be true if `return_amount < expected_return` https://github.com/enigmampc/SecretSwap/blob/6135f0/contracts/secretswap_pair/src/contract.rs#L677-L678

                const offer_amount = Number(this.state.fromInput);
                const ask_amount = Number(this.state.toInput);
                const expected_return =
                  ask_amount * (1 - this.state.slippageTolerance);
                const belief_price = beliefPriceNumberFormat.format(
                  reverse_decimal(expected_return / offer_amount),
                );
                const max_spread = '0';

                if (this.state.fromToken === 'SCRT') {
                  await this.props.secretjs.execute(
                    pair.contract_addr,
                    {
                      swap: {
                        offer_asset: {
                          info: { native_token: { denom: 'uscrt' } },
                          amount: amountInTokenDenom,
                        },
                        belief_price: belief_price,
                        max_spread: max_spread,
                        // offer_asset: Asset,
                        // belief_price: Option<Decimal>,
                        // max_spread: Option<Decimal>,
                        // to: Option<HumanAddr>, // TODO
                      },
                    },
                    '',
                    [
                      {
                        amount: amountInTokenDenom,
                        denom: 'uscrt',
                      },
                    ],
                  );
                } else {
                  await this.props.secretjs.execute(
                    this.props.tokens[this.state.fromToken].address,
                    {
                      send: {
                        recipient: pair.contract_addr,
                        amount: amountInTokenDenom,
                        msg: btoa(
                          JSON.stringify({
                            swap: {
                              belief_price: belief_price,
                              max_spread: max_spread,
                              // belief_price: Option<Decimal>,
                              // max_spread: Option<Decimal>,
                              // to: Option<HumanAddr>, // TODO
                            },
                          }),
                        ),
                      },
                    },
                  );
                }
              } catch (error) {
                console.error('Swap error', error);
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
            minimumReceived={
              Number(this.state.toInput) * (1 - this.state.slippageTolerance)
              /*
              this.state.isToEstimated
                ? Number(this.state.toInput) *
                  (1 - this.state.slippageTolerance)
                : null
              */
            }
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

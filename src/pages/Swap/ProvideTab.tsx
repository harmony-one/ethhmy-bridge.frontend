import {
  compute_offer_amount,
  compute_swap,
} from '../../blockchain-bridge/scrt/swap';
import React from 'react';
import { SigningCosmWasmClient } from 'secretjs';
import { Button, Container } from 'semantic-ui-react';
import { swapInputNumberFormat } from 'utils';
import { flexRowSpace, Pair, swapContainerStyle, TokenDisplay } from '.';
import { AssetRow } from './AssetRow';
import { sortedStringify } from './SwapTab';
import { TabsHeader } from './TabsHeader';
import { PriceRow } from './PriceRow';

const plus = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#00ADE8"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const BUTTON_MSG_ENTER_AMOUNT = 'Enter an amount';
const BUTTON_MSG_NO_TRADNIG_PAIR = 'Trading pair does not exist';
const BUTTON_MSG_LOADING_PRICE = 'Loading price data';
const BUTTON_MSG_SUPPLY = 'Supply';

export class ProvideTab extends React.Component<
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
    tokenA: string;
    tokenB: string;
    inputA: string;
    inputB: string;
    isEstimatedA: boolean;
    isEstimatedB: boolean;
    buttonMessage: string;
    loadingProvide: boolean;
  }
> {
  constructor(props) {
    super(props);

    let [tokenA, tokenB] = ['', ''];
    const firstPairSymbol = Object.keys(props.pairFromSymbol)[0];
    if (firstPairSymbol) {
      [tokenA, tokenB] = firstPairSymbol.split('/');
    }

    this.state = {
      tokenA,
      tokenB,
      inputA: '',
      inputB: '',
      isEstimatedA: false,
      isEstimatedB: false,
      buttonMessage: '',
      loadingProvide: false,
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
      sortedStringify(previousProps.pairFromSymbol) !==
      sortedStringify(this.props.pairFromSymbol)
    ) {
      const firstPairSymbol = Object.keys(this.props.pairFromSymbol)[0];
      if (firstPairSymbol) {
        const [tokenA, tokenB] = firstPairSymbol.split('/');
        this.setState({
          tokenA,
          tokenB,
        });
      }
    }
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
      // => inputB = inputA*(poolB/poolA)
      const inputB = Number(this.state.inputA) * (poolB / poolA);

      if (isNaN(inputB) || this.state.inputA === '') {
        this.setState({
          isEstimatedA: false,
          inputB: '',
          isEstimatedB: false,
        });
      } else {
        this.setState({
          inputB: inputB < 0 ? '' : swapInputNumberFormat.format(inputB),
          isEstimatedB: inputB >= 0,
        });
      }
    } else if (this.state.isEstimatedA) {
      // inputA/inputB = poolA/poolB
      // => inputA = inputB*(poolA/poolB)
      const inputA = Number(this.state.inputB) * (poolA / poolB);

      if (isNaN(inputA) || this.state.inputB === '') {
        this.setState({
          isEstimatedB: false,
          inputA: '',
          isEstimatedA: false,
        });
      } else {
        this.setState({
          isEstimatedB: false,
          inputA: inputA < 0 ? '' : swapInputNumberFormat.format(inputA),
          isEstimatedA: inputA >= 0,
        });
      }
    }
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
      buttonMessage = BUTTON_MSG_SUPPLY;
    }

    return (
      <Container style={swapContainerStyle}>
        <TabsHeader />
        <AssetRow
          label="Input"
          maxButton={true}
          balance={balanceA}
          tokens={this.props.tokens}
          token={this.state.tokenA}
          setToken={(value: string) => {
            if (value === this.state.tokenB) {
              // switch
              this.setState(
                {
                  tokenA: value,
                  isEstimatedA: this.state.isEstimatedB,
                  inputA: this.state.inputB,
                  tokenB: this.state.tokenA,
                  isEstimatedB: this.state.isEstimatedA,
                  inputB: this.state.inputA,
                },
                () => this.updateInputs(),
              );
            } else {
              this.setState(
                {
                  tokenA: value,
                  inputA: '',
                  isEstimatedA: true,
                  isEstimatedB: false,
                },
                () => this.updateInputs(),
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
          setToken={(value: string) => {
            if (value === this.state.tokenA) {
              // switch
              this.setState(
                {
                  tokenB: value,
                  isEstimatedB: this.state.isEstimatedA,
                  inputB: this.state.inputA,
                  tokenA: this.state.tokenB,
                  isEstimatedA: this.state.isEstimatedB,
                  inputA: this.state.inputB,
                },
                () => this.updateInputs(),
              );
            } else {
              this.setState(
                {
                  tokenB: value,
                  inputB: '',
                  isEstimatedB: true,
                  isEstimatedA: false,
                },
                () => this.updateInputs(),
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
        <Button
          disabled={
            buttonMessage !== BUTTON_MSG_SUPPLY || this.state.loadingProvide
          }
          loading={this.state.loadingProvide}
          primary={buttonMessage === BUTTON_MSG_SUPPLY}
          fluid
          style={{
            margin: '1em 0 0 0',
            borderRadius: '12px',
            padding: '18px',
            fontSize: '20px',
          }}
          onClick={async () => {
            this.setState({
              loadingProvide: true,
            });

            // TODO

            this.setState({
              loadingProvide: false,
              inputA: '',
              inputB: '',
              isEstimatedA: false,
              isEstimatedB: false,
            });
          }}
        >
          {buttonMessage}
        </Button>
      </Container>
    );
  }
}

import BigNumber from 'bignumber.js';
import React from 'react';
import { SigningCosmWasmClient } from 'secretjs';
import { Container, Image, Button, Divider, Header } from 'semantic-ui-react';
import { CSSProperties } from 'styled-components';
import { displayHumanizedBalance, humanizeBalance } from 'utils';
import { flexRowSpace, Pair, TokenDisplay } from '.';
import { PriceRow } from './PriceRow';
import { downArrow } from './SwapTab';

export class WithdrawLiquidityPanel extends React.Component<
  {
    lpTokenSymbol: string;
    tokens: {
      [symbol: string]: TokenDisplay;
    };
    balances: {
      [symbol: string]: BigNumber | JSX.Element;
    };
    secretjs: SigningCosmWasmClient;
    pairFromSymbol: {
      [symbol: string]: Pair;
    };
  },
  {
    isLoading: boolean;
    withdrawPercentage: number;
  }
> {
  constructor(props) {
    super(props);
  }

  state = {
    isLoading: false,
    withdrawPercentage: 0,
  };

  render() {
    const pairSymbol = this.props.lpTokenSymbol.replace('LP-', '');
    const pair = this.props.pairFromSymbol[pairSymbol];

    const [tokenA, tokenB] = pairSymbol.split('/');

    const decimalsA = this.props.tokens[tokenA].decimals;
    const decimalsB = this.props.tokens[tokenB].decimals;

    const lpTokenBalance = this.props.balances[this.props.lpTokenSymbol];
    const lpTokenTotalSupply = this.props.balances[
      this.props.lpTokenSymbol + '-total-supply'
    ] as BigNumber;

    let lpShare = new BigNumber(0);
    let lpShareJsxElement = lpTokenBalance; // View Balance
    let pooledTokenA: string;
    let pooledTokenB: string;

    const lpTokenBalanceNum = new BigNumber(lpTokenBalance as BigNumber);
    if (!lpTokenBalanceNum.isNaN()) {
      if (lpTokenTotalSupply.isGreaterThan(0)) {
        lpShare = lpTokenBalanceNum.dividedBy(lpTokenTotalSupply);

        pooledTokenA = displayHumanizedBalance(
          humanizeBalance(
            lpShare.multipliedBy(
              this.props.balances[`${tokenA}-${pairSymbol}`] as BigNumber,
            ),
            decimalsA,
          ),
        );

        pooledTokenB = displayHumanizedBalance(
          humanizeBalance(
            lpShare.multipliedBy(
              this.props.balances[`${tokenB}-${pairSymbol}`] as BigNumber,
            ),
            decimalsB,
          ),
        );

        lpShareJsxElement = (
          <span>{`${lpTokenBalanceNum
            .multipliedBy(100)
            .dividedBy(lpTokenTotalSupply)
            .toFormat(2)}%`}</span>
        );
      } else {
        pooledTokenA = '0';
        pooledTokenB = '0';
        lpShareJsxElement = <span>0%</span>;
      }
    }

    const getLogo = (symbol: string) => (
      <Image
        src={this.props.tokens[symbol].logo}
        avatar
        style={{
          boxShadow: 'rgba(0, 0, 0, 0.075) 0px 6px 10px',
          borderRadius: '24px',
          maxHeight: '24px',
          maxWidth: '24px',
        }}
      />
    );

    const rowStyle: CSSProperties = {
      display: 'flex',
      flexDirection: 'row',
      padding: '0.5em 0 0 0',
    };

    const poolA = new BigNumber(
      this.props.balances[`${tokenA}-${pairSymbol}`] as any,
    );
    const poolB = new BigNumber(
      this.props.balances[`${tokenB}-${pairSymbol}`] as any,
    );

    const price = humanizeBalance(poolA, decimalsA).dividedBy(
      humanizeBalance(poolB, decimalsB),
    );

    const lpTokenBalanceString = lpTokenBalanceNum.toFormat(0, {
      groupSeparator: '',
    });
    const amountInTokenDenom = lpTokenBalanceNum
      .multipliedBy(this.state.withdrawPercentage)
      .toFormat(0, {
        groupSeparator: '',
      });

    return (
      <Container
        style={{
          padding: '1rem',
          borderRadius: '20px',
          border: '1px solid rgb(247, 248, 250)',
          backgroundColor: 'white',
        }}
      >
        <Divider horizontal>
          <Header as="h4">
            {' '}
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
              }}
            >
              {getLogo(tokenA)}
              {getLogo(tokenB)}
              <span
                style={{
                  margin: 'auto',
                }}
              >
                {pairSymbol}
              </span>
              {flexRowSpace}
            </div>
          </Header>
        </Divider>
        <div style={rowStyle}>
          <span>Your Total Pool Tokens</span>
          {flexRowSpace}
          {lpTokenBalanceNum.isNaN()
            ? lpTokenBalance
            : displayHumanizedBalance(humanizeBalance(lpTokenBalanceNum, 6))}
        </div>
        {!lpTokenBalanceNum.isNaN() && (
          <>
            <div style={rowStyle}>
              <span style={{ margin: 'auto' }}>{`Pooled ${tokenA}`}</span>
              {flexRowSpace}
              <span style={{ margin: 'auto', paddingRight: '0.3em' }}>
                {pooledTokenA}
              </span>
              {getLogo(tokenA)}
            </div>
            <div style={rowStyle}>
              <span style={{ margin: 'auto' }}>{`Pooled ${tokenB}`}</span>
              {flexRowSpace}
              <span style={{ margin: 'auto', paddingRight: '0.3em' }}>
                {pooledTokenB}
              </span>
              {getLogo(tokenB)}
            </div>
            <div style={rowStyle}>
              <span>Your Pool Share</span>
              {flexRowSpace}
              {lpShareJsxElement}
            </div>
            {lpTokenBalanceString === '0' ? null : (
              <>
                <Divider horizontal>
                  <Header as="h4">Withdraw</Header>
                </Divider>
                <div
                  style={{
                    ...rowStyle,
                    fontSize: '50px',
                    paddingBottom: '0.2em',
                  }}
                >
                  {flexRowSpace}
                  {`${new BigNumber(
                    this.state.withdrawPercentage * 100,
                  ).toFixed(0)}%`}
                  {flexRowSpace}
                </div>
                <div style={{ ...rowStyle, paddingBottom: '0.2em' }}>
                  <input
                    style={{
                      flex: 1,
                      margin: '0 3px',
                    }}
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={this.state.withdrawPercentage}
                    onChange={e => {
                      this.setState({
                        withdrawPercentage: Number(e.target.value),
                      });
                    }}
                  />
                </div>
                <div style={rowStyle}>
                  <Button
                    basic
                    color="blue"
                    style={{
                      flex: 1,
                      borderRadius: '12px',
                      padding: '10px',
                    }}
                    onClick={async () => {
                      this.setState({ withdrawPercentage: 0.25 });
                    }}
                  >
                    25%
                  </Button>
                  <Button
                    basic
                    color="blue"
                    style={{
                      flex: 1,
                      borderRadius: '12px',
                      padding: '10px',
                      marginLeft: '1em',
                    }}
                    onClick={async () => {
                      this.setState({ withdrawPercentage: 0.5 });
                    }}
                  >
                    50%
                  </Button>
                  <Button
                    basic
                    color="blue"
                    style={{
                      flex: 1,
                      borderRadius: '12px',
                      padding: '10px',
                      marginLeft: '1em',
                    }}
                    onClick={async () => {
                      this.setState({ withdrawPercentage: 0.75 });
                    }}
                  >
                    75%
                  </Button>
                  <Button
                    basic
                    color="blue"
                    style={{
                      flex: 1,
                      borderRadius: '12px',
                      padding: '10px',
                      marginLeft: '1em',
                    }}
                    onClick={async () => {
                      this.setState({ withdrawPercentage: 1 });
                    }}
                  >
                    MAX
                  </Button>
                </div>
                <div style={rowStyle}>
                  {flexRowSpace}
                  {downArrow}
                  {flexRowSpace}
                </div>
                <div style={rowStyle}>
                  <span style={{ margin: 'auto' }}>{tokenA}</span>
                  {flexRowSpace}
                  <span style={{ margin: 'auto', paddingRight: '0.3em' }}>
                    {this.state.withdrawPercentage === 0 ||
                    this.state.withdrawPercentage === 1
                      ? null
                      : '~'}
                    {displayHumanizedBalance(
                      new BigNumber(
                        pooledTokenA.replace(/,/g, ''),
                      ).multipliedBy(this.state.withdrawPercentage),
                    )}
                  </span>
                  {getLogo(tokenA)}
                </div>
                <div style={rowStyle}>
                  <span style={{ margin: 'auto' }}>{tokenB}</span>
                  {flexRowSpace}
                  <span style={{ margin: 'auto', paddingRight: '0.3em' }}>
                    {this.state.withdrawPercentage === 0 ||
                    this.state.withdrawPercentage === 1
                      ? null
                      : '~'}
                    {displayHumanizedBalance(
                      new BigNumber(
                        pooledTokenB.replace(/,/g, ''),
                      ).multipliedBy(this.state.withdrawPercentage),
                    )}
                  </span>
                  {getLogo(tokenB)}
                </div>
                {!price.isNaN() && (
                  <PriceRow
                    fromToken={tokenA}
                    toToken={tokenB}
                    price={price.toNumber()}
                  />
                )}
                <div style={rowStyle}>
                  {flexRowSpace}
                  <Button
                    primary
                    loading={this.state.isLoading}
                    disabled={
                      this.state.isLoading || amountInTokenDenom === '0'
                    }
                    style={{
                      margin: '0.5em 0 0 0',
                      borderRadius: '12px',
                      padding: '18px',
                      fontSize: '20px',
                    }}
                    onClick={async () => {
                      this.setState({ isLoading: true });

                      try {
                        await this.props.secretjs.execute(
                          pair.liquidity_token,
                          {
                            send: {
                              recipient: pair.contract_addr,
                              amount: amountInTokenDenom,
                              msg: btoa(
                                JSON.stringify({ withdraw_liquidity: {} }),
                              ),
                            },
                          },
                        );
                        this.setState({
                          withdrawPercentage: 0,
                        });
                      } catch (error) {
                        console.error(error);
                        return;
                      }

                      this.setState({
                        isLoading: false,
                      });
                    }}
                  >
                    Withdraw
                  </Button>
                  {flexRowSpace}
                </div>
              </>
            )}
          </>
        )}{' '}
      </Container>
    );
  }
}

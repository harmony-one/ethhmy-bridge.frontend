import BigNumber from 'bignumber.js';
import React from 'react';
import { SigningCosmWasmClient } from 'secretjs';
import { Accordion, Button, Container, Divider, Header, Image } from 'semantic-ui-react';
import { CSSProperties } from 'styled-components';
import { displayHumanizedBalance, humanizeBalance } from 'utils';
import { PriceRow } from '../../components/Swap/PriceRow';
import { getFeeForExecute } from '../../blockchain-bridge';
import { FlexRowSpace } from '../../components/Swap/FlexRowSpace';
import { SwapTokenMap } from './types/SwapToken';
import { SwapPair } from './types/SwapPair';
import { DownArrow } from '../../ui/Icons/DownArrow';
import { PairAnalyticsLink } from '../../components/Swap/PairAnalyticsLink';
import Loader from 'react-loader-spinner';
import { shareOfPoolNumberFormat, storeTxResultLocally } from './utils';

export class WithdrawLiquidityPanel extends React.Component<
  {
    lpTokenSymbol: string;
    tokens: SwapTokenMap;
    balances: { [symbol: string]: BigNumber | JSX.Element };
    secretjs: SigningCosmWasmClient;
    selectedPair: SwapPair;
    notify: (type: 'success' | 'error', msg: string, closesAfterMs?: number) => void;
    getBalance: CallableFunction;
    onCloseTab: CallableFunction;
  },
  {
    isLoading: boolean;
    withdrawPercentage: number;
    isActive: boolean;
    isLoadingBalance: boolean;
  }
> {
  state = {
    isLoading: false,
    withdrawPercentage: 0,
    isActive: false,
    isLoadingBalance: false,
  };

  render() {
    const pairSymbol = this.props.lpTokenSymbol.replace('LP-', '');

    let [symbolA, symbolB] = [
      this.props.selectedPair.asset_infos[0].symbol,
      this.props.selectedPair.asset_infos[1].symbol,
    ];

    let selectedPair = this.props.selectedPair;
    if (symbolB === 'sSCRT') {
      selectedPair = new SwapPair(
        symbolB,
        selectedPair.asset_infos[1].info,
        symbolA,
        selectedPair.asset_infos[0].info,
        selectedPair.contract_addr,
        selectedPair.liquidity_token,
        selectedPair.pair_identifier,
      );

      symbolB = symbolA;
      symbolA = 'sSCRT';
    }
    if (selectedPair.pair_identifier.includes(process.env.SSCRT_CONTRACT)) {
      const tokenB = selectedPair.pair_identifier.split('/').filter(a => a !== process.env.SSCRT_CONTRACT);
      selectedPair.pair_identifier = `${process.env.SSCRT_CONTRACT}/${tokenB}`;
    }

    const [tokenA, tokenB] = selectedPair.assetIds();

    const decimalsA = this.props.tokens.get(tokenA)?.decimals;
    const decimalsB = this.props.tokens.get(tokenB)?.decimals;

    const lpTokenBalance = this.props.balances[this.props.lpTokenSymbol];
    const lpTokenTotalSupply = this.props.balances[this.props.lpTokenSymbol + '-total-supply'] as BigNumber;

    let lpShare = new BigNumber(0);
    let lpShareJsxElement = lpTokenBalance; // View Balance
    let pooledTokenA: string;
    let pooledTokenB: string;

    const lpTokenBalanceNum = new BigNumber(lpTokenBalance as BigNumber);
    if (!lpTokenBalanceNum.isNaN()) {
      if (lpTokenTotalSupply.isGreaterThan(0)) {
        lpShare = lpTokenBalanceNum.dividedBy(lpTokenTotalSupply);

        pooledTokenA = displayHumanizedBalance(
          humanizeBalance(lpShare.multipliedBy(this.props.balances[`${tokenA}-${pairSymbol}`] as BigNumber), decimalsA),
        );

        pooledTokenB = displayHumanizedBalance(
          humanizeBalance(lpShare.multipliedBy(this.props.balances[`${tokenB}-${pairSymbol}`] as BigNumber), decimalsB),
        );

        lpShareJsxElement = (
          <span>{`${shareOfPoolNumberFormat.format(
            lpTokenBalanceNum
              .multipliedBy(100)
              .dividedBy(lpTokenTotalSupply)
              .toNumber(),
          )}%`}</span>
        );
      } else {
        pooledTokenA = '0';
        pooledTokenB = '0';
        lpShareJsxElement = <span>0%</span>;
      }
    }

    const getLogo = (address: string) => (
      <Image
        src={this.props.tokens.get(address)?.logo}
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
      padding: '0.5em 0 0 0',
    };

    const poolA = new BigNumber(this.props.balances[`${tokenA}-${pairSymbol}`] as any);
    const poolB = new BigNumber(this.props.balances[`${tokenB}-${pairSymbol}`] as any);

    const price = humanizeBalance(poolA, decimalsA).dividedBy(humanizeBalance(poolB, decimalsB));

    const lpTokenBalanceString = lpTokenBalanceNum.toFormat(0, {
      groupSeparator: '',
    });
    const amountInTokenDenom = lpTokenBalanceNum.multipliedBy(this.state.withdrawPercentage).toFormat(0, {
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
        <Accordion fluid>
          <Accordion.Title
            active={this.state.isActive}
            onClick={async () => {
              this.setState({ isActive: !this.state.isActive }, async () => {
                if (this.state.isActive) {
                  this.setState({ isLoadingBalance: true });
                  // get balances and subscribe for events for this pair
                  await this.props.getBalance(selectedPair);
                  this.setState({ isLoadingBalance: false });
                } else {
                  // unsubscribe
                  this.props.onCloseTab(selectedPair);
                }
              });
            }}
          >
            <div
              style={{
                display: 'flex',
              }}
            >
              {getLogo(tokenA)}
              {getLogo(tokenB)}
              <strong
                style={{
                  margin: 'auto',
                }}
              >
                {selectedPair.humanizedSymbol()}
              </strong>
              <FlexRowSpace />
            </div>
          </Accordion.Title>
          <Accordion.Content active={this.state.isActive}>
            {this.state.isLoadingBalance ? (
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Loader type="ThreeDots" color="#00BFFF" height="0.5em" />
              </div>
            ) : null}
            <div hidden={this.state.isLoadingBalance}>
              <div style={rowStyle}>
                <span>Your Total Pool Tokens</span>
                <FlexRowSpace />
                {lpTokenBalanceNum.isNaN()
                  ? lpTokenBalance
                  : displayHumanizedBalance(humanizeBalance(lpTokenBalanceNum, 6))}
              </div>
              {!lpTokenBalanceNum.isNaN() && (
                <>
                  <div style={rowStyle}>
                    <span style={{ margin: 'auto' }}>{`Pooled ${this.props.tokens.get(tokenA)?.symbol}`}</span>
                    <FlexRowSpace />
                    <span style={{ margin: 'auto', paddingRight: '0.3em' }}>{pooledTokenA}</span>
                    {getLogo(tokenA)}
                  </div>
                  <div style={rowStyle}>
                    <span style={{ margin: 'auto' }}>{`Pooled ${this.props.tokens.get(tokenB)?.symbol}`}</span>
                    <FlexRowSpace />
                    <span style={{ margin: 'auto', paddingRight: '0.3em' }}>{pooledTokenB}</span>
                    {getLogo(tokenB)}
                  </div>
                  <div style={rowStyle}>
                    <span>Your Pool Share</span>
                    <FlexRowSpace />
                    {lpShareJsxElement}
                  </div>
                </>
              )}
              <PairAnalyticsLink pairAddress={selectedPair?.contract_addr} />
              {lpTokenBalanceNum.isNaN() || lpTokenBalanceString === '0' ? null : (
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
                    <FlexRowSpace />
                    {`${new BigNumber(this.state.withdrawPercentage * 100).toFixed(0)}%`}
                    <FlexRowSpace />
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
                    <FlexRowSpace />
                    <DownArrow />
                    <FlexRowSpace />
                  </div>
                  <div style={rowStyle}>
                    <span style={{ margin: 'auto' }}>{this.props.tokens.get(tokenA)?.symbol}</span>
                    <FlexRowSpace />
                    <span style={{ margin: 'auto', paddingRight: '0.3em' }}>
                      {this.state.withdrawPercentage === 0 || this.state.withdrawPercentage === 1 ? null : '~'}
                      {displayHumanizedBalance(
                        new BigNumber(pooledTokenA.replace(/,/g, '')).multipliedBy(this.state.withdrawPercentage),
                      )}
                    </span>
                    {getLogo(tokenA)}
                  </div>
                  <div style={rowStyle}>
                    <span style={{ margin: 'auto' }}>{this.props.tokens.get(tokenB)?.symbol}</span>
                    <FlexRowSpace />
                    <span style={{ margin: 'auto', paddingRight: '0.3em' }}>
                      {this.state.withdrawPercentage === 0 || this.state.withdrawPercentage === 1 ? null : '~'}
                      {displayHumanizedBalance(
                        new BigNumber(pooledTokenB.replace(/,/g, '')).multipliedBy(this.state.withdrawPercentage),
                      )}
                    </span>
                    {getLogo(tokenB)}
                  </div>
                  {!price.isNaN() && (
                    <PriceRow
                      fromToken={this.props.tokens.get(tokenA)?.symbol}
                      toToken={this.props.tokens.get(tokenB)?.symbol}
                      price={price.toNumber()}
                    />
                  )}
                  <div style={rowStyle}>
                    <FlexRowSpace />
                    <Button
                      primary
                      loading={this.state.isLoading}
                      disabled={this.state.isLoading || amountInTokenDenom === '0'}
                      style={{
                        margin: '0.5em 0 0 0',
                        borderRadius: '12px',
                        padding: '18px',
                        fontSize: '20px',
                      }}
                      onClick={async () => {
                        this.setState({ isLoading: true });

                        const { withdrawPercentage } = this.state;

                        try {
                          const result = await this.props.secretjs.execute(
                            selectedPair.liquidity_token,
                            {
                              send: {
                                recipient: selectedPair.contract_addr,
                                amount: amountInTokenDenom,
                                msg: btoa(
                                  JSON.stringify({
                                    withdraw_liquidity: {},
                                  }),
                                ),
                              },
                            },
                            '',
                            [],
                            getFeeForExecute(500_000),
                          );
                          storeTxResultLocally(result);

                          this.props.notify(
                            'success',
                            `Withdrawn ${100 * withdrawPercentage}% from your pooled ${selectedPair.humanizedSymbol()}`,
                          );

                          this.setState({
                            withdrawPercentage: 0,
                          });
                        } catch (error) {
                          this.props.notify(
                            'error',
                            `Error withdrawing ${100 *
                              withdrawPercentage}% from your pooled ${selectedPair.humanizedSymbol()}: ${
                              error.message
                            }`,
                          );
                          console.error(error);
                        }

                        this.setState({
                          isLoading: false,
                        });
                      }}
                    >
                      Withdraw
                    </Button>
                    <FlexRowSpace />
                  </div>
                </>
              )}
            </div>
          </Accordion.Content>
        </Accordion>
      </Container>
    );
  }
}

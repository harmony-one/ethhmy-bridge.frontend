import BigNumber from 'bignumber.js';
import React from 'react';
import { SigningCosmWasmClient } from 'secretjs';
import { Container, Image, Button } from 'semantic-ui-react';
import { CSSProperties } from 'styled-components';
import { flexRowSpace, Pair, TokenDisplay } from '.';

export class LiquidityRow extends React.Component<
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
  { isLoading: boolean }
> {
  constructor(props) {
    super(props);
  }

  state = { isLoading: false };

  render() {
    const pairSymbol = this.props.lpTokenSymbol.replace('LP-', '');
    const pair = this.props.pairFromSymbol[pairSymbol];

    const [tokenA, tokenB] = pairSymbol.split('/');

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

        pooledTokenA = lpShare
          .multipliedBy(
            this.props.balances[`${tokenA}-${pairSymbol}`] as BigNumber,
          )
          .dividedBy(new BigNumber(`1e${this.props.tokens[tokenA].decimals}`))
          .toFormat(6);

        pooledTokenB = lpShare
          .multipliedBy(
            this.props.balances[`${tokenB}-${pairSymbol}`] as BigNumber,
          )
          .dividedBy(new BigNumber(`1e${this.props.tokens[tokenB].decimals}`))
          .toFormat(6);

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

    return (
      <Container
        style={{
          padding: '1rem',
          borderRadius: '20px',
          border: '1px solid rgb(247, 248, 250)',
          backgroundColor: 'white',
        }}
      >
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
              fontSize: '16px',
              fontWeight: 'bold',
              margin: 'auto',
            }}
          >
            {pairSymbol}
          </span>
          {flexRowSpace}
        </div>
        <div style={rowStyle}>
          <span>Your Total Pool Tokens</span>
          {flexRowSpace}
          {lpTokenBalanceNum.isNaN()
            ? lpTokenBalance
            : lpTokenBalanceNum.dividedBy(new BigNumber(`1e6`)).toFormat(6)}
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
            <div style={rowStyle}>
              {flexRowSpace}
              <Button
                primary
                loading={this.state.isLoading}
                disabled={this.state.isLoading}
                style={{
                  borderRadius: '12px',
                  padding: '10px',
                }}
                onClick={async () => {
                  this.setState({ isLoading: true });

                  const amountInTokenDenom = lpTokenBalanceNum.toFormat(0, {
                    groupSeparator: '',
                  });

                  try {
                    await this.props.secretjs.execute(pair.liquidity_token, {
                      send: {
                        recipient: pair.contract_addr,
                        amount: amountInTokenDenom,
                        msg: btoa(JSON.stringify({ withdraw_liquidity: {} })),
                      },
                    });
                  } catch (error) {
                    console.error(error);
                  }

                  this.setState({ isLoading: false });
                }}
              >
                Withdraw
              </Button>
              {flexRowSpace}
            </div>
          </>
        )}{' '}
      </Container>
    );
  }
}

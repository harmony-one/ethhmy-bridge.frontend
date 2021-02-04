import BigNumber from 'bignumber.js';
import React from 'react';
import { SigningCosmWasmClient } from 'secretjs';
import { Container } from 'semantic-ui-react';
import { UserStoreEx } from 'stores/UserStore';
import { Pair, swapContainerStyle, TokenDisplay } from '.';
import { WithdrawLiquidityPanel } from './WithdrawLiqudityPanel';
import { TabsHeader } from './TabsHeader';

export class WithdrawTab extends React.Component<{
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
}> {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Container style={swapContainerStyle}>
        <TabsHeader />
        {Object.keys(this.props.balances)
          .filter(
            lpTokenSymbol =>
              lpTokenSymbol.startsWith('LP') &&
              !lpTokenSymbol.includes('total-supply'),
          )
          .map(lpTokenSymbol => (
            <span key={lpTokenSymbol}>
              <WithdrawLiquidityPanel
                lpTokenSymbol={lpTokenSymbol}
                tokens={this.props.tokens}
                balances={this.props.balances}
                secretjs={this.props.secretjs}
                pairFromSymbol={this.props.pairFromSymbol}
              />
              <div style={{ minHeight: '1em' }} />
            </span>
          ))}
      </Container>
    );
  }
}

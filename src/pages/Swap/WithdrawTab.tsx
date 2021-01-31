import React from 'react';
import { SigningCosmWasmClient } from 'secretjs';
import { Button, Container } from 'semantic-ui-react';
import { UserStoreEx } from 'stores/UserStore';
import { flexRowSpace, Pair, swapContainerStyle, TokenDisplay } from '.';
import { AssetRow } from './AssetRow';
import { LiquidityRow } from './LiqudityRow';
import { TabsHeader } from './TabsHeader';

export class WithdrawTab extends React.Component<{
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
              <LiquidityRow
                lpTokenSymbol={lpTokenSymbol}
                tokens={this.props.tokens}
                balances={this.props.balances}
              />
              <div style={{ minHeight: '1em' }} />
            </span>
          ))}
      </Container>
    );
  }
}

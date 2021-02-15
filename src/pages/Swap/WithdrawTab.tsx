import BigNumber from 'bignumber.js';
import React from 'react';
import { SigningCosmWasmClient } from 'secretjs';
import { Container } from 'semantic-ui-react';
import { UserStoreEx } from 'stores/UserStore';
import { flexRowSpace, Pair, swapContainerStyle, TokenDisplay } from '.';
import { WithdrawLiquidityPanel } from './WithdrawLiqudityPanel';
import { TabsHeader } from './TabsHeader';
import Loader from 'react-loader-spinner';
import { SwapTokenMap } from './SwapToken';

export class WithdrawTab extends React.Component<{
  user: UserStoreEx;
  secretjs: SigningCosmWasmClient;
  tokens: SwapTokenMap;
  balances: { [symbol: string]: BigNumber | JSX.Element };
  pairs: Array<Pair>;
  pairFromSymbol: { [symbol: string]: Pair };
  notify: (type: 'success' | 'error', msg: string, closesAfterMs?: number) => void;
}> {
  render() {
    const withdrawPanelList = Object.keys(this.props.balances)
      .filter(lpTokenSymbol => lpTokenSymbol.startsWith('LP') && !lpTokenSymbol.includes('total-supply'))
      .map(lpTokenSymbol => (
        <span key={lpTokenSymbol}>
          <WithdrawLiquidityPanel
            lpTokenSymbol={lpTokenSymbol}
            tokens={{}} //this.props.tokens
            balances={this.props.balances}
            secretjs={this.props.secretjs}
            pairFromSymbol={this.props.pairFromSymbol}
            notify={this.props.notify}
          />
          <div style={{ minHeight: '1em' }} />
        </span>
      ));

    if (withdrawPanelList.length === 0) {
      return (
        <Container style={swapContainerStyle}>
          <TabsHeader />
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Loader type="ThreeDots" color="#00BFFF" height="0.5em" />
          </div>
        </Container>
      );
    }

    return (
      <Container style={swapContainerStyle}>
        <TabsHeader />
        {withdrawPanelList}
      </Container>
    );
  }
}

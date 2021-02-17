import BigNumber from 'bignumber.js';
import React from 'react';
import { SigningCosmWasmClient } from 'secretjs';
import { Container } from 'semantic-ui-react';
import { UserStoreEx } from 'stores/UserStore';
import { PairMap, swapContainerStyle } from '.';
import { WithdrawLiquidityPanel } from './WithdrawLiqudityPanel';
import { TabsHeader } from './TabsHeader';
import Loader from 'react-loader-spinner';
import { SwapTokenMap } from './SwapToken';

export class WithdrawTab extends React.Component<{
  user: UserStoreEx;
  secretjs: SigningCosmWasmClient;
  tokens: SwapTokenMap;
  balances: { [symbol: string]: BigNumber | JSX.Element };
  pairs: PairMap;
  notify: (type: 'success' | 'error', msg: string, closesAfterMs?: number) => void;
  updateToken: CallableFunction;
}> {
  async componentDidUpdate(
    prevProps: Readonly<{
      user: UserStoreEx;
      secretjs: SigningCosmWasmClient;
      tokens: SwapTokenMap;
      balances: { [p: string]: BigNumber | JSX.Element };
      pairs: PairMap;
      notify: (type: 'success' | 'error', msg: string, closesAfterMs?: number) => void;
      updateToken: CallableFunction;
    }>,
    prevState: Readonly<{}>,
    snapshot?: any,
  ) {
    if (prevProps.pairs.size !== this.props.pairs.size) {
      const tasks = Array.from(this.props.pairs.values()).map(pair => this.props.updateToken(pair));
      await Promise.all(tasks);
    }
  }

  render() {
    const withdrawPanelList = Object.keys(this.props.balances)
      .filter(lpTokenSymbol => lpTokenSymbol.startsWith('LP') && !lpTokenSymbol.includes('total-supply'))
      .map(lpTokenSymbol => {
        const pairSymbol = lpTokenSymbol.replace('LP-', '');
        const selectedPair = this.props.pairs.get(pairSymbol);

        if (selectedPair) {
          return (
            <span key={lpTokenSymbol}>
              <WithdrawLiquidityPanel
                lpTokenSymbol={lpTokenSymbol}
                tokens={this.props.tokens}
                selectedPair={selectedPair}
                balances={this.props.balances}
                secretjs={this.props.secretjs}
                notify={this.props.notify}
              />
              <div style={{ minHeight: '1em' }} />
            </span>
          );
        } else {
          return <></>;
        }
      });

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

import BigNumber from 'bignumber.js';
import React from 'react';
import { SigningCosmWasmClient } from 'secretjs';
import { Container } from 'semantic-ui-react';
import { UserStoreEx } from 'stores/UserStore';
import { WithdrawLiquidityPanel } from './WithdrawLiqudityPanel';
import { TabsHeader } from './TabsHeader';
import { SwapTokenMap } from './types/SwapToken';
import cn from 'classnames';
import * as styles from './styles.styl';
import { PairMap } from './types/SwapPair';
import Loader from 'react-loader-spinner';

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
    const pairs = Array.from(this.props.pairs.values());

    if (pairs.length === 0) {
      return (
        <Container className={cn(styles.swapContainerStyle)}>
          <TabsHeader />
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Loader type="ThreeDots" color="#00BFFF" height="0.5em" />
          </div>
        </Container>
      );
    }

    return (
      <Container className={cn(styles.swapContainerStyle)}>
        <TabsHeader />
        {pairs.map(p => {
          return (
            <span key={p.lpTokenSymbol()}>
              <WithdrawLiquidityPanel
                lpTokenSymbol={p.lpTokenSymbol()}
                tokens={this.props.tokens}
                selectedPair={p}
                balances={this.props.balances}
                secretjs={this.props.secretjs}
                notify={this.props.notify}
              />
              <div style={{ minHeight: '1em' }} />
            </span>
          );
        })}
      </Container>
    );
  }
}

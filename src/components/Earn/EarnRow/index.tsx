import React, { Component } from 'react';

import * as styles from './styles.styl';
import cn from 'classnames';
import { Accordion, Icon, Image } from 'semantic-ui-react';
import SoftTitleValue from '../SoftTitleValue';
import EarnButton from './EarnButton';
import DepositContainer from './DepositContainer';
import ClaimBox from './ClaimBox';
import { UserStoreEx } from '../../../stores/UserStore';
import { observer } from 'mobx-react';
import WithdrawButton from './WithdrawButton';


interface RewardsToken {
  name: string;
  decimals: string;
  display_props: {
    image: string;
    label: string;
    symbol: string;
  };
  balance: string;
  deposit: string;
  rewards: string;
  rewardsContract: string;
  rewardsDecimals: string;
  lockedAsset: string;
  lockedAssetAddress: string;
  totalLockedRewards: string;
  remainingLockedRewards: string;
  deadline: number;
}

const calculateAPY = (token: RewardsToken) => {

  // deadline - current time, 6 seconds per block
  const timeRemaining = (token.deadline - Math.round(Date.now() / 1000) );

  return ((Number(token.remainingLockedRewards) / timeRemaining) * 100).toFixed(0);

}

// const balanceDisplay = (value) => {
//   return value ? value : <Loader type="ThreeDots" color="#00BFFF" height="1em" width="1em" />
// }

@observer
class EarnRow extends Component<{
    userStore: UserStoreEx,
    token: RewardsToken
  }> {
  state = { activeIndex: -1, value: '0.0' }

  handleChange = (event) => {
    this.setState({value: event.target.value});
  }

  handleClick = (e, titleProps) => {
    const { index } = titleProps
    const { activeIndex } = this.state
    const newIndex = activeIndex === index ? -1 : index

    this.setState({ activeIndex: newIndex })
  };



  render() {
    //this.props.userStore.keplrWallet.suggestToken(this.props.userStore.chainId, );
    const { activeIndex } = this.state
    return (
      <Accordion className={cn(styles.accordion)}>
        <Accordion.Title
          active={activeIndex === 0}
          index={0}
          onClick={this.handleClick}
          className={cn(styles.assetRow)}
        >
            <div className={cn(styles.assetIcon)}>
              <Image src={this.props.token.display_props.image} rounded size='mini' />
            </div>
            <div className={cn(styles.assetName)}>
              <SoftTitleValue title={this.props.token.display_props.label} subTitle={this.props.token.display_props.symbol} />
            </div>
            <div className={cn(styles.totalRewards)}>
              <SoftTitleValue title={`${this.props.token.totalLockedRewards} sSCRT`} subTitle={"Total Rewards"} />
            </div>
          <div className={cn(styles.totalRewards)}>
            <SoftTitleValue title={`${calculateAPY(this.props.token)}%`} subTitle={"Annual Percentage Yield"} />
          </div>
            <div className={cn(styles.availableDeposit)}>
              <SoftTitleValue title={`${this.props.token.balance}`} subTitle={`${this.props.token.lockedAsset} Available to Deposit`} />
            </div>
            <Icon name='dropdown'/>
        </Accordion.Title>
        <Accordion.Content active={activeIndex === 0}>
          <div className={cn(styles.content2)}>
            <DepositContainer
              value={this.state.value}
              onChange={this.handleChange}
              action={EarnButton(this.props, this.state.value)}
              balance={this.props.token.balance}
              currency={this.props.token.lockedAsset}
            />
            <DepositContainer
              value={this.state.value}
              onChange={this.handleChange}
              action={WithdrawButton(this.props, this.state.value)}
              balance={this.props.token.deposit}
              currency={this.props.token.lockedAsset}
            />
          </div>
          <div>
            <ClaimBox
              available={this.props.token.rewards}
              decimals={6} // this.props.token.rewardsDecimals
              userStore={this.props.userStore}
              rewardsContract={this.props.token.rewardsContract}
            />
          </div>
        </Accordion.Content>
      </Accordion>);
  }
}


export default EarnRow;

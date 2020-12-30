import React, { Component, Requireable } from 'react';

import * as styles from './styles.styl';
import cn from 'classnames';
import { Accordion, Icon, Image, Input } from 'semantic-ui-react';
import SoftTitleValue from '../SoftTitleValue';
import EarnButton from './EarnButton';
import ChangeBalance from './ChangeBalance';
import ClaimBox from './ClaimBox';
import { SigningCosmWasmClient } from 'secretjs';

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
  lockedAsset: string;
  totalLockedRewards: string;
}

//const calculateAPY = (rewards)

class AssetRow extends Component<{
    cosmJS: SigningCosmWasmClient,
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
            <SoftTitleValue title={"20,000% APY"} subTitle={"Annual Percentage Yield"} />
          </div>
            <div className={cn(styles.availableDeposit)}>
              <SoftTitleValue title={`${this.props.token.balance} ${this.props.token.lockedAsset}`} subTitle={"Available to Deposit"} />
            </div>
            <Icon name='dropdown'/>
        </Accordion.Title>
        <Accordion.Content active={activeIndex === 0}>
          <div className={cn(styles.content2)}>
            <ChangeBalance
              value={this.state.value}
              onChange={this.handleChange}
              action={EarnButton(this.props)}
              balance={this.props.token.balance}
              currency={this.props.token.lockedAsset}
            />
            <ClaimBox
              available={this.props.token.balance}
              cosmJS={this.props.cosmJS}
              contract={this.props.token.rewardsContract}
            />
          </div>
        </Accordion.Content>
      </Accordion>);
  }
}


export default AssetRow;

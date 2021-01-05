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
import { divDecimals, formatWithSixDecimals, zeroDecimalsFormatter } from '../../../utils';
import { Text } from '../../Base/components/Text';
import ScrtTokenBalance from '../ScrtTokenBalance';


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

const calculateAPY = (token: RewardsToken, price: number, priceUnderlying: number) => {
  // console.log(Math.round(Date.now() / 1000000))
  // deadline - current time, 6 seconds per block
  // const timeRemaining = (token.deadline - Math.round(Date.now() / 1000000) );
  const pending = Number(divDecimals(token.remainingLockedRewards, token.decimals)) * priceUnderlying;
  const locked = Number(divDecimals(token.totalLockedRewards, token.rewardsDecimals)) * price;
  return ((pending * 100) / locked).toFixed(0);

}

// const balanceDisplay = (value) => {
//   return value ? value : <Loader type="ThreeDots" color="#00BFFF" height="1em" width="1em" />
// }

@observer
class EarnRow extends Component<{
    userStore: UserStoreEx,
    token: RewardsToken
  }> {
  state = { activeIndex: -1, depositValue: '0.0', withdrawValue: '0.0' }

  handleChangeDeposit = (event) => {
    this.setState({depositValue: event.target.value});
  }

  handleChangeWithdraw = (event) => {
    this.setState({withdrawValue: event.target.value});
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
              <SoftTitleValue title={`${zeroDecimalsFormatter.format(Number(calculateAPY(this.props.token, 0.6, 1000)))}%`} subTitle={"Annual Percentage Yield"} />
            </div>
            <div className={cn(styles.totalRewards)}>
              <SoftTitleValue title={`${formatWithSixDecimals(Number(this.props.token.totalLockedRewards))}$`} subTitle={"Total Value Locked"} />
            </div>
            <div className={cn(styles.availableDeposit)}>
              <ScrtTokenBalance value={this.props.token.balance}
                                decimals={0}
                                currency={this.props.token.lockedAsset}
                                userStore={this.props.userStore}
                                tokenAddress={this.props.token.lockedAssetAddress}
                                selected={this.state.activeIndex === 0}
                                minimumFactions={0}
                                subtitle={`Available to Deposit`} />

              {/*/<SoftTitleValue title={`${} ${} `}  />*/}
            </div>
            <Icon name='dropdown'/>
        </Accordion.Title>
        <Accordion.Content active={activeIndex === 0}>
          <div className={cn(styles.content2)}>
            <DepositContainer
              value={this.state.depositValue}
              onChange={this.handleChangeDeposit}
              action={EarnButton(this.props, this.state.depositValue)}
              balance={this.props.token.balance}
              currency={this.props.token.lockedAsset}
            />
            <DepositContainer
              value={this.state.withdrawValue}
              onChange={this.handleChangeWithdraw}
              action={WithdrawButton(this.props, this.state.withdrawValue)}
              balance={this.props.token.deposit}
              currency={this.props.token.lockedAsset}
            />
          </div>
          <div>
            <ClaimBox
              available={this.props.token.rewards}
              userStore={this.props.userStore}
              rewardsContract={this.props.token.rewardsContract}
            />
          </div>
          <Text
            size="medium"
            style={{ padding: '20 20 0 20', cursor: 'auto', textAlign: 'center' }}
          >
            * Every time you deposit, withdraw or claim the contract will automagically claim your rewards for you!
          </Text>
        </Accordion.Content>
      </Accordion>);
  }
}


export default EarnRow;

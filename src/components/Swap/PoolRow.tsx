import { observer } from 'mobx-react';
import React, { Component } from 'react';
import { UserStoreEx } from '../../stores/UserStore';
import cn from 'classnames';
import { Accordion, Icon, Image } from 'semantic-ui-react';
import * as styles from './styles.styl';
import { Text } from '../Base/components/Text';
import PairIcons from './PairIcons/PairIcons';
import { AddLiquidityButton } from './Buttons/AddLiquidityButton';
import { CreateAPairButton } from './Buttons/CreateAPairButton';
import { PairInfoRow } from './PairInfoRow';

interface PairAssetInfo {
  asset0: string;
  asset1: string;
}

@observer
class PoolRow extends Component<
  {
    // userStore: UserStoreEx;
    // pairAssetInfo: PairAssetInfo;
  },
  { activeIndex: Number }
> {
  state = {
    activeIndex: -1,
  };

  handleClick = (e, titleProps) => {
    const { index } = titleProps;
    const { activeIndex } = this.state;
    const newIndex = activeIndex === index ? -1 : index;

    this.setState({ activeIndex: newIndex });
  };

  render() {
    const { activeIndex } = this.state;
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Text>Your Liquidity</Text>
          <div style={{ display: 'flex' }}>
            <CreateAPairButton />
            <AddLiquidityButton />
          </div>
        </div>
        <Accordion
          className={cn(styles.accordion)}
          style={{
            marginTop: '62px',
          }}
        >
          <Accordion.Title
            active={activeIndex === 0}
            index={0}
            onClick={this.handleClick}
            className={cn(styles.assetRow)}
          >
            <div className={cn(styles.assetRowLeft)}>
              <PairIcons
                image0={'https://etherscan.io/token/images/uniswap_32.png'}
                image1={
                  'https://s2.coinmarketcap.com/static/img/coins/64x64/5604.png'
                }
              />
              <div className={cn(styles.assetName)}>WSCRT/ETH</div>
            </div>
            <div className={cn(styles.assetRowRight)}>
              <div>Info</div>
              <Icon name="dropdown" />
            </div>
          </Accordion.Title>
          <Accordion.Content active={activeIndex === 0}>
            <PairInfoRow
              itemLeft={'Your total pool tokens:'}
              itemRight={'0.00001'}
            />
            <PairInfoRow
              itemLeft={'Pooled WSCRT:'}
              itemRight={
                <div style={{ display: 'flex' }}>
                  '3.00201'
                  <Image
                    src={
                      'https://s2.coinmarketcap.com/static/img/coins/64x64/5604.png'
                    }
                    rounded
                    size="mini"
                  />
                </div>
              }
            />
            <PairInfoRow
              itemLeft={'Pooled ETH:'}
              itemRight={
                <div style={{ display: 'flex' }}>
                  '0.40002'
                  <Image
                    src={'https://etherscan.io/token/images/uniswap_32.png'}
                    rounded
                    size="mini"
                  />
                </div>
              }
            />
            <PairInfoRow itemLeft={'Your pool share:'} itemRight={'33.21%'} />
            <Text
              size="medium"
              style={{
                padding: '20 20 0 20',
                cursor: 'auto',
                textAlign: 'center',
              }}
            >
              * Every time you deposit, withdraw or claim the contract will
              automagically claim your rewards for you!
            </Text>
          </Accordion.Content>
        </Accordion>
      </div>
    );
  }
}

export default PoolRow;

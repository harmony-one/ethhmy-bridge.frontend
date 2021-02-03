import { observer } from 'mobx-react';
import React, { Component } from 'react';
import { UserStoreEx } from '../../stores/UserStore';
import cn from 'classnames';
import { Accordion } from 'semantic-ui-react';
import * as styles from '.styles.styl';
import { Text } from '../Base/components/Text';


interface PairAssetInfo {
  asset0: string;
  asset1: string;
}

@observer
class PoolRow extends Component<
  {
    userStore: UserStoreEx;
    pairAssetInfo: PairAssetInfo;
  }, { activeIndex: Number; }
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
    return <Accordion className={cn(styles)}
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

        <div className={cn(styles.assetName)}>
        </div>
      </Accordion.Title>
      <Accordion.Content active={activeIndex === 0}>
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
  }
}

export default PoolRow;
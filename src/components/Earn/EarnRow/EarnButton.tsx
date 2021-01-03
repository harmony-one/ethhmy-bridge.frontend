import { Button } from 'semantic-ui-react';
import { DepositRewards } from '../../../blockchain-bridge/scrt';
import React from 'react';
import { valueToDecimals } from '../../../utils';
import cn from 'classnames';
import * as styles from './styles.styl';


// todo: add failed toast or something
const EarnButton = (props, value) => {
  return (
    <button
      className={cn(styles.button, styles.ripple)}
      onClick={() => {
        DepositRewards({
          secretjs: props.userStore.secretjs,
          recipient: props.token.rewardsContract,
          address: props.token.lockedAssetAddress,
          amount: valueToDecimals(value, props.token.decimals)}).catch(reason =>
            console.log(`Failed to deposit: ${reason}`)
        )
      }}
    >
      Earn
    </button>
  );
}

export default EarnButton;

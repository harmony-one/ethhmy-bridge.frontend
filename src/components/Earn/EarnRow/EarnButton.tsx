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
      disabled={Number(value) === 0 || isNaN(value)}
      onClick={() => {
        DepositRewards({
          secretjs: props.userStore.secretjs,
          recipient: props.token.rewardsContract,
          address: props.token.lockedAssetAddress,
          // maximum precision for the contract is 6 decimals
          amount: valueToDecimals(Number(value).toFixed(6), props.token.decimals)}).catch(reason =>
            console.log(`Failed to deposit: ${reason}`)
        )
      }}
    >
      Earn
    </button>
  );
}

export default EarnButton;

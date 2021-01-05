import { Button } from 'semantic-ui-react';
import { Redeem } from '../../../blockchain-bridge/scrt';
import React from 'react';
import { valueToDecimals } from '../../../utils';
import cn from 'classnames';
import * as styles from './styles.styl';


const WithdrawButton = (props, value) => {
  return (
    <button
      className={cn(styles.button, styles.ripple)}
      disabled={Number(value) === 0 || isNaN(value)}
      onClick={() => {
        Redeem({
          secretjs: props.userStore.secretjs,
          address: props.token.rewardsContract,
          amount: valueToDecimals(Number(value).toFixed(6), props.token.decimals)}).catch(reason =>
            console.log(`Failed to withdraw: ${reason}`)
        )
      }}
    >
      Withdraw
    </button>
  );
}

export default WithdrawButton;

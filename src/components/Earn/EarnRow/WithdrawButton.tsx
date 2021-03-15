import { Redeem } from '../../../blockchain-bridge/scrt';
import React, { useState } from 'react';
import { valueToDecimals } from '../../../utils';
import cn from 'classnames';
import * as styles from './styles.styl';
import { Button } from 'semantic-ui-react';

const WithdrawButton = ({ props, value, changeValue }) => {
  const [loading, setLoading] = useState<boolean>(false);

  return (
    <Button
      loading={loading}
      className={cn(styles.button, 'ui', 'blue', 'basic', 'button', 'circular')}
      disabled={Number(value) === 0 || isNaN(value)}
      onClick={async () => {
        setLoading(true);
        await Redeem({
          secretjs: props.userStore.secretjs,
          address: props.token.rewardsContract,
          amount: valueToDecimals(Number(value).toFixed(6), props.token.decimals),
        })
          .then(_ => {
            props.notify('success', `Withdraw successful!`);
            changeValue({
              target: {
                value: '0.0',
              },
            })
          })
          .catch(reason => {
            props.notify('error', `Failed to withdraw: ${reason}`);
            console.log(`Failed to withdraw: ${reason}`)
          });
        setLoading(false);
      }}
    >
      Withdraw
    </Button>
  );
};

export default WithdrawButton;

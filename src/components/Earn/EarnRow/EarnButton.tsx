import { DepositRewards } from '../../../blockchain-bridge/scrt';
import React, { useState } from 'react';
import { valueToDecimals } from '../../../utils';
import cn from 'classnames';
import * as styles from './styles.styl';
import { Button } from 'semantic-ui-react';
import { unlockToken } from '../../../utils';

// todo: add failed toast or something
const EarnButton = ({ props, value, changeValue, togglePulse, setPulseInterval }) => {
  const [loading, setLoading] = useState<boolean>(false);

  return (
    <Button
      loading={loading}
      className={cn(styles.button, 'ui', 'blue', 'basic', 'button', 'circular')}
      disabled={Number(value) === 0 || isNaN(value)}
      onClick={async () => {
        setLoading(true);
        await DepositRewards({
          secretjs: props.userStore.secretjs,
          recipient: props.token.rewardsContract,
          address: props.token.lockedAssetAddress,
          // maximum precision for the contract is 6 decimals
          amount: valueToDecimals(Number(value).toFixed(6), props.token.decimals),
        })
          .then(_ => {
            changeValue({
              target: {
                value: '0.0',
              },
            });

            if (props.token.deposit === unlockToken) {
              togglePulse();
              const interval = setInterval(togglePulse, 700);
              setPulseInterval(interval);
            }
          })
          .catch(reason => console.log(`Failed to deposit: ${reason}`));
        setLoading(false);
      }}
    >
      Earn
    </Button>
  );
};

export default EarnButton;

import { Redeem } from '../../../blockchain-bridge/scrt';
import React, { useState } from 'react';
import { SigningCosmWasmClient } from 'secretjs';
import cn from 'classnames';
import * as styles from './styles.styl';
import { Button } from 'semantic-ui-react';

const ClaimButton = (props: {
  secretjs: SigningCosmWasmClient;
  contract: string;
  available: string;
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  console.log('HI TOM THIS IS LOG: ' + props.available);
  return (
    <Button
      loading={loading}
      className={cn(styles.button, 'ui', 'blue', 'basic', 'button', 'circular')}
      disabled={
        typeof props.available === 'undefined' || props.available === '0'
      }
      onClick={async () => {
        setLoading(true);
        await Redeem({
          secretjs: props.secretjs,
          address: props.contract,
          amount: '0',
        }).catch(reason => console.log(`Failed to claim: ${reason}`));
        setLoading(false);
      }}
    >
      Claim
    </Button>
  );
};

export default ClaimButton;

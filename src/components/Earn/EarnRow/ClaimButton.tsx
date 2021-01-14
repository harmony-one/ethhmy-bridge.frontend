import { Redeem } from '../../../blockchain-bridge/scrt';
import React, { useState } from 'react';
import { SigningCosmWasmClient } from 'secretjs';
import cn from 'classnames';
import * as styles from './styles.styl';
import { Button } from 'semantic-ui-react';
import { useStores } from 'stores';

const ClaimButton = (props: {
  secretjs: SigningCosmWasmClient;
  contract: string;
  available: string;
  symbol: string;
}) => {
  const { user } = useStores();
  const [loading, setLoading] = useState<boolean>(false);
  return (
    <Button
      loading={loading}
      className={cn(styles.button, 'ui', 'blue', 'basic', 'button', 'circular')}
      disabled={
        typeof props.available === 'undefined' || props.available === '0'
      }
      onClick={async () => {
        setLoading(true);
        try {
          await Redeem({
            secretjs: props.secretjs,
            address: props.contract,
            amount: '0',
          });
          await user.updateBalanceForSymbol(props.symbol);
        } catch (reason) {
          console.error(`Failed to claim: ${reason}`);
        }

        setLoading(false);
      }}
    >
      Claim
    </Button>
  );
};

export default ClaimButton;

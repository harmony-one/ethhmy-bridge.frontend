import { Redeem } from '../../../blockchain-bridge/scrt';
import React from 'react';
import { SigningCosmWasmClient } from 'secretjs';
import cn from 'classnames';
import * as styles from './styles.styl';


const ClaimButton = (props: {secretjs: SigningCosmWasmClient, contract: string}) => {
  return (
    <button
      className={cn(styles.button, styles.ripple)}
      onClick={() => {
        Redeem({
          secretjs: props.secretjs,
          address: props.contract,
          amount: "0"
        }).catch(reason =>
          console.log(`Failed to claim: ${reason}`)
        )
      }}
    >
      Claim
    </button>
  );
}

export default ClaimButton;

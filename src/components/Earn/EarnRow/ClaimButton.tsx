import { Button } from 'semantic-ui-react';
import { Claim, Redeem } from '../../../blockchain-bridge/scrt';
import React from 'react';
import { SigningCosmWasmClient } from 'secretjs';

const claimButtonStyle = {
  borderRadius: '50px',
  height: '47px',
  fontWeight: 500,
  width: "100%",
  color: "#2F80ED",
  backgroundColor: "transparent",
  border: "1px solid rgba(47, 128, 237, 0.5)",
};


const ClaimButton = (props: {secretjs: SigningCosmWasmClient, contract: string}) => {
  return (
    <Button
      style={claimButtonStyle}
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
    </Button>
  );
}

export default ClaimButton;

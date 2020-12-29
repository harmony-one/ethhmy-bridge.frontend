import { Button } from 'semantic-ui-react';
import { Redeem } from '../../blockchain-bridge/scrt';
import React from 'react';

const claimButtonStyle = {
  borderRadius: '50px',
  height: '47px',
  fontWeight: 500,
  width: "100%",
  color: "#2F80ED",
  backgroundColor: "transparent",
  border: "1px solid rgba(47, 128, 237, 0.5)",
};


const ClaimButton = props => {
  return (
    <Button
      style={claimButtonStyle}
      onClick={() => {
        Redeem({
          cosmJS: props.user.cosmJS,
          address: "secret1phq7va80a83z2sqpyqsuxhl045ruf2ld6xa89m",
          amount: "1000000000000000"
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

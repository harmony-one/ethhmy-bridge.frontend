import { Button } from 'semantic-ui-react';
import { DepositRewards } from '../../blockchain-bridge/scrt';
import React from 'react';

const earnButtonStyle = {
  borderRadius: '50px',
  height: '47px',
  fontWeight: 500,
  width: "100%",
  color: "#2F80ED",
  backgroundColor: "transparent",
  border: "1px solid rgba(47, 128, 237, 0.5)",
};


const EarnButton = props => {
  return (
    <Button
      style={earnButtonStyle}
      onClick={() => {
        DepositRewards({
          cosmJS: props.user.cosmJS,
          recipient: props.token.rewardsContract,
          address: props.token.lockedAsset,
          amount: props.value}).catch(reason =>
          console.log(`Failed to deposit: ${reason}`)
        )
      }}
    >
      Earn
    </Button>
  );
}

export default EarnButton;

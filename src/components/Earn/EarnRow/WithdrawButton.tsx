import { Button } from 'semantic-ui-react';
import { Redeem } from '../../../blockchain-bridge/scrt';
import React from 'react';
import { valueToDecimals } from '../../../utils';

const earnButtonStyle = {
  borderRadius: '50px',
  height: '47px',
  fontWeight: 500,
  width: "100%",
  color: "#2F80ED",
  backgroundColor: "transparent",
  border: "1px solid rgba(47, 128, 237, 0.5)",
};


const WithdrawButton = (props, value) => {
  return (
    <Button
      style={earnButtonStyle}
      onClick={() => {
        Redeem({
          secretjs: props.userStore.secretjs,
          address: props.token.rewardsContract,
          amount: valueToDecimals(value, props.token.decimals)}).catch(reason =>
            console.log(`Failed to withdraw: ${reason}`)
        )
      }}
    >
      Withdraw
    </Button>
  );
}

export default WithdrawButton;

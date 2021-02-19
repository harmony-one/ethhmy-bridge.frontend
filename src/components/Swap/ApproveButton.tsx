import React from 'react';
import { Button } from 'semantic-ui-react';

const buttonStyle = {
  margin: '0.5em 0 0 0',
  borderRadius: '12px',
  padding: '18px',
  fontSize: '20px',
};

export const ApproveButton = (props: { disabled: boolean; loading: boolean; onClick: any; token: string }) => (
  <Button disabled={props.disabled} loading={props.loading} primary fluid style={buttonStyle} onClick={props.onClick}>
    {`Approve ${props.token}`}
  </Button>
);

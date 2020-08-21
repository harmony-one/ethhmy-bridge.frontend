import * as React from 'react';
import { Button } from 'components/Base';
import { Spinner2 } from './Spinner2';

export const ButtonEx = ({
  textRender = null,
  spinnerRender = (
    <Spinner2
      height="20px"
      width="20px"
      color="white"
      style={{ marginRight: 5 }}
    />
  ),
  isLoading,
  children,
  onClick,
  ...buttonProps
}: ButtonExProps) => (
  <Button onClick={isLoading ? () => {} : onClick} {...buttonProps}>
    {isLoading ? spinnerRender : textRender}
    {children}
  </Button>
);

type ButtonExProps = React.ComponentProps<typeof Button> & {
  textRender?: React.ReactNode;
  spinnerRender?: React.ReactNode;
  children?: React.ReactNode;
};

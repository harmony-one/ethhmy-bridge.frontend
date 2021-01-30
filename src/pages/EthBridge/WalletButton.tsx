import { Box } from 'grommet';
import { Button } from '../../components/Base/components/Button';
import { Error } from '../../ui/Error';
import * as React from 'react';

export const WalletButton = (props: any) => {
  const { error, children, ...buttonProps } = props;

  return (
    <Box
      direction="row"
      justify="start"
      align="baseline"
      margin={{ bottom: 'small' }}
    >
      <Button
        margin={{ right: 10 }}
        pad={{ vertical: 'xsmall' }}
        style={{
          borderRadius: 5,
          border: '1px solid #dedede',
          width: 180,
          textAlign: 'center',
        }}
        transparent={true}
        {...buttonProps}
      >
        {children}
      </Button>
      {error ? <Error error={error} /> : null}
    </Box>
  );
};

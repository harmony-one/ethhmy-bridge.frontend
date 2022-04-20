import * as React from 'react';
import { Box } from 'grommet';

export const Footer: typeof Box = props => (
  <Box
    flex={{ shrink: 0 }}
    direction="row"
    justify="center"
    pad={{ vertical: 'small' }}
    {...props}
    gap="8px"
  />
);

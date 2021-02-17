import * as React from 'react';
import { Box } from 'grommet';

export const Footer: typeof Box = props => (
  <Box
    flex={{ shrink: 0 }}
    style={{ borderTop: '1px solid rgb(231, 236, 247)' }}
    direction="row"
    justify="end"
    pad={{ horizontal: 'xlarge', vertical: 'large' }}
    {...props}
  />
);

import React from 'react';
import { Box } from 'grommet';
import { NetworkSourceControl } from '../NetworkSourceControl/NetworkSourceControl';
import { NetworkDestination } from '../NetworkDestination/NetworkDestination';
import { NetworkDirection } from '../NetworkDirection/NetworkDirection';
import { observer } from 'mobx-react';

interface Props {}

export const NetworkRow: React.FC<Props> = observer(() => {
  return (
    <Box
      direction="row"
      justify="around"
      align="center"
      style={{ height: '168px' }}
    >
      <Box basis="0" flex="grow">
        <NetworkSourceControl />
      </Box>
      <Box>
        <NetworkDirection />
      </Box>
      <Box basis="0" flex="grow">
        <NetworkDestination />
      </Box>
    </Box>
  );
});

NetworkRow.displayName = 'NetworkRow';

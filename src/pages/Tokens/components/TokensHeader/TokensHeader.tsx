import React from 'react';
import { Box } from 'grommet';
import { Text } from '../../../../components/Base';
import { formatZeroDecimals } from '../../../../utils';

interface Props {
  lastUpdate: number;
  totalLocked: number;
}

export const TokensHeader: React.FC<Props> = ({ lastUpdate, totalLocked }) => {
  return (
    <Box direction="column">
      <Box pad={{ bottom: '9px' }}>
        <Text
          color="NGray4"
          style={{ fontSize: '9px' }}
        >{`Updated ${lastUpdate} seconds ago`}</Text>
      </Box>
      <Box pad={{ bottom: '7px' }}>
        <Text color="NBlue" style={{ fontSize: '48px' }}>
          ${formatZeroDecimals(totalLocked)}
        </Text>
      </Box>
      <Box>
        <Text style={{ fontSize: '20px' }}>Total Value Locked</Text>
      </Box>
    </Box>
  );
};

TokensHeader.displayName = 'TokenHeader';

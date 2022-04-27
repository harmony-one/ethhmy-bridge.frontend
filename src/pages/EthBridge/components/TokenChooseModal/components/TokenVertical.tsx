import React from 'react';
import { Box } from 'grommet/components/Box';
import { Text } from '../../../../../components/Base';

interface TokenVerticalProps {
  icon: string;
  symbol: string;
}
export const TokenVertical: React.FC<TokenVerticalProps> = ({
  icon,
  symbol,
}) => {
  return (
    <Box direction="column" align="center" gap="4px">
      <Box>
        <img width="20px" height="20px" src={icon} />
      </Box>
      <Box>
        <Text color="NWhite" size="xxxsmall" lh="19px">
          {symbol}
        </Text>
      </Box>
    </Box>
  );
};

TokenVertical.displayName = 'TokenVertical';

import React from 'react';
import { Box } from 'grommet/components/Box';
import { Text } from '../../../../../components/Base';

interface TokenVerticalProps {
  icon: string;
  symbol: string;
  onClick: () => void;
}
export const TokenVertical: React.FC<TokenVerticalProps> = ({
  icon,
  symbol,
  onClick,
}) => {
  return (
    <Box direction="column" align="center" gap="4px" onClick={onClick}>
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

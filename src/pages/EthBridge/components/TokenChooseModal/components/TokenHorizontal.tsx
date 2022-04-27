import React from 'react';
import { Box } from 'grommet/components/Box';
import { Text } from '../../../../../components/Base';

interface TokenHorizontalProps {
  className?: string;
  symbol: string;
  icon: string;
  label: string;
  onClick: () => void;
}

export const TokenHorizontal: React.FC<TokenHorizontalProps> = ({
  className,
  symbol,
  label,
  icon,
  onClick,
}) => {
  return (
    <Box
      direction="row"
      className={className}
      align="center"
      gap="18px"
      onClick={onClick}
      pad={{ horizontal: '28px', vertical: '16px' }}
      style={{ minHeight: '58px' }}
    >
      <Box>
        <img src={icon} width="16px" height="16px" />
      </Box>
      <Box>
        <Text color="NWhite" size="xsmall">
          {symbol}
        </Text>
        <Text color="NGray4" size="xxsmall">
          {label}
        </Text>
      </Box>
      <Box margin={{ left: 'auto' }}>
        <Text color="NWhite" size="xsmall" lh="19px">
          0
        </Text>
      </Box>
    </Box>
  );
};

TokenHorizontal.displayName = 'TokenHorizontal';

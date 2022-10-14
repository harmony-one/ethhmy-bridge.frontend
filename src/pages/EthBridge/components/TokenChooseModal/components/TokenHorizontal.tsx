import React from 'react';
import { Box } from 'grommet/components/Box';
import { Text } from '../../../../../components/Base';

interface TokenHorizontalProps {
  className?: string;
  symbol: string;
  icon: string;
  label: string;
  balance: number | string;
  onClick: () => void;
}

export const TokenHorizontal: React.FC<TokenHorizontalProps> = ({
  className,
  symbol,
  label,
  balance = 0,
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
        <img src={icon} width="20px" height="20px" />
      </Box>
      <Box>
        <Text size="medium">{symbol}</Text>
        <Text color="NGray4" size="xsmall">
          {label}
        </Text>
      </Box>
      <Box margin={{ left: 'auto' }}>
        <Text size="xsmall" lh="19px">
          {balance}
        </Text>
      </Box>
    </Box>
  );
};

TokenHorizontal.displayName = 'TokenHorizontal';

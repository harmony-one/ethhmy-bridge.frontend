import React from 'react';
import { Box } from 'grommet/components/Box';
import { Text } from '../../../../../components/Base';
import styled from 'styled-components';

interface TokenVerticalProps {
  icon: string;
  active?: boolean;
  symbol: string;
  onClick: () => void;
}

const StyledBox = styled(Box)<Pick<TokenVerticalProps, 'active'>>`
  border: 1px solid;
  padding: 8px 16px;
  border-radius: 10px;

  border-color: ${props =>
    props.active
      ? props.theme.tokenVertical.borderColorActive
      : props.theme.tokenVertical.borderColor};
`;

export const TokenVertical: React.FC<TokenVerticalProps> = ({
  icon,
  active = false,
  symbol,
  onClick,
}) => {
  return (
    <StyledBox
      active={active}
      direction="column"
      align="center"
      gap="12px"
      onClick={onClick}
    >
      <Box>
        <img width="40px" height="40px" src={icon} />
      </Box>
      <Box>
        <Text size="xxsmall" lh="19px">
          {symbol}
        </Text>
      </Box>
    </StyledBox>
  );
};

TokenVertical.displayName = 'TokenVertical';

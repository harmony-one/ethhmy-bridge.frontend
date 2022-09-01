import React from 'react';
import styled from 'styled-components';
import { Box } from 'grommet/components/Box';

export const TipContent = styled(Box)`
  background-color: ${props => props.theme.tipContent.bgColor};
  border: ${props => props.theme.tipContent.border};
`;

TipContent.displayName = 'TipContent';

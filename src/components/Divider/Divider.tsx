import React from 'react';
import * as s from './Divider.styl';
import styled from 'styled-components';
interface Props {}

const StyledDiv = styled.div`
  height: 1px;
  border-bottom: 1px solid ${props => props.theme.divider.color};
  opacity: ${props => props.theme.divider.opacity};
`;

export const Divider: React.FC<Props> = () => {
  return <StyledDiv />;
};

Divider.displayName = 'Divider';

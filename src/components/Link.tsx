import React from 'react';
import styled from 'styled-components';

interface Props {
  monospace?: boolean;
}

export const Link = styled.a<Props>`
  font-family: ${props => (props.monospace ? 'monospace' : 'inherit')};
  color: #356ae5;
`;

Link.displayName = 'Link';

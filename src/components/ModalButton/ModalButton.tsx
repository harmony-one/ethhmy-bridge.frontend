import React from 'react';
import { Button } from 'grommet';
import styled from 'styled-components';

interface Props {
  accent?: boolean;
}

export const ModalButton = styled(Button)<Props>`
  background-color: ${props =>
    props.accent ? props.theme.palette.NBlue : '#575757'};
  border-radius: 15px;
  padding: 4px 20px;
  font-size: 14px;
  color: ${props => props.theme.palette.NWhite};
`;

ModalButton.displayName = 'ModalButton';

import React from 'react';
import { Box } from 'grommet';
import * as s from './LayoutCommon.styl';
import { Header } from '../../Header/Header';
import styled from 'styled-components';

interface Props {}

const StyledBox = styled(Box)`
  font-family: GothamRounded;
  color: ${props => props.theme.layout.color};
`;

const Background = styled.div`
  background-image: url('/public/harmony_bglogo_black.svg');
  background-position: 100% 100%;
  background-repeat: no-repeat;
  background-size: initial;
  background-color: ${props => props.theme.layout.bgColor};
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  z-index: -1;
`;

const HeaderDivider = styled.div`
  border-bottom: 1px solid #313131;
  height: 1px;
  opacity: ${props => props.theme.headerDivider.opacity};
  box-sizing: border-box;
`;

export const LayoutCommon: React.FC<Props> = ({ children }) => {
  return (
    <StyledBox direction="column" fill>
      <Background />
      <Box className={s.headerContainer}>
        <Header />
      </Box>
      <HeaderDivider />
      <Box className={s.contentContainer} align="center" justify="center">
        {children}
      </Box>
    </StyledBox>
  );
};

LayoutCommon.displayName = 'LayoutCommon';

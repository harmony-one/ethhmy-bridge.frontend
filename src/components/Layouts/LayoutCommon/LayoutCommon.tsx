import React from 'react';
import { Box } from 'grommet';
import * as s from './LayoutCommon.styl';
import { Header } from '../../Header/Header';

interface Props {}

export const LayoutCommon: React.FC<Props> = ({ children }) => {
  return (
    <Box direction="column" fill className={s.root}>
      <div className={s.bgImage} />
      <Box className={s.headerContainer}>
        <Header />
      </Box>
      <div className={s.headerLine} />
      <Box className={s.contentContainer} align="center" justify="center">
        {children}
      </Box>
    </Box>
  );
};

LayoutCommon.displayName = 'LayoutCommon';

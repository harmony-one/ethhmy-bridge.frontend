import React from 'react';
import { Box } from 'grommet';
import * as s from '../StepBASE/StepBASE.styl';
import { Status } from '../Status/Status';
import { Details } from '../../../Exchange/Details';

interface Props {}

export const StepRESULT: React.FC<Props> = () => {
  return (
    <Box className={s.root} margin={{ top: '60px' }}>
      <Box pad="60px">
        <Details>
          <Status />
        </Details>
      </Box>
    </Box>
  );
};

StepRESULT.displayName = 'StepRESULT';

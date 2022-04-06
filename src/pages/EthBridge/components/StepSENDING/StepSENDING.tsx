import React from 'react';
import { Details } from '../../../Exchange/Details';
import * as s from '../StepBASE/StepBASE.styl';
import { Box } from 'grommet/components/Box';
import { Status } from '../Status/Status';

interface Props {}

export const StepSENDING: React.FC<Props> = () => {
  return (
    <Box className={s.root} margin={{ top: '60px' }}>
      <Details>
        <Status />
      </Details>
    </Box>
  );
};

StepSENDING.displayName = 'StepSENDING';

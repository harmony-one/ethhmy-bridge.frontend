import React from 'react';
import { Details } from '../../../Exchange/Details';
import * as s from '../StepBASE/StepBASE.styl';
import { Box } from 'grommet/components/Box';
import { Status } from '../Status/Status';
import { Networks } from '../Networks/Networks';
import { Divider } from '../../../../components/Divider/Divider';

interface Props {}

export const StepSENDING: React.FC<Props> = () => {
  return (
    <Box className={s.root} margin={{ top: '60px' }}>
      <Networks />
      <Divider />
      <Box pad="60px">
        <Details>
          <Status />
        </Details>
      </Box>
    </Box>
  );
};

StepSENDING.displayName = 'StepSENDING';

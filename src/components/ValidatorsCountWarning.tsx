import React from 'react';
import { Box } from 'grommet';
import { Text } from './Base';

interface Props {}

export const ValidatorsCountWarning: React.FC<Props> = () => {
  return (
    <Box pad="large">
      <Text>
        <b>The work of the bridge is temporarily suspended.</b>
        <br />
        We do our best to resume it as quickly as possible.
        <br />
        Sorry for the inconvenience.
      </Text>
    </Box>
  );
};

ValidatorsCountWarning.displayName = 'ValidatorsCountWarning';

import React from 'react';
import { Box } from 'grommet';
import { Text } from '../../../../components/Base';

interface Props {
  title: string;
  centerContent: React.ReactNode;
  bottomContent: React.ReactNode;
  gap?: string;
}

export const BridgeControl: React.FC<Props> = ({
  title,
  centerContent,
  bottomContent,
  gap = '16px',
}) => {
  return (
    <Box direction="column" gap={gap} justify="center" align="center">
      <Box>
        <Text size="xsmall" color="NGray">
          {title}
        </Text>
      </Box>
      <Box>{centerContent}</Box>
      <Box>{bottomContent}</Box>
    </Box>
  );
};

BridgeControl.displayName = 'BridgeControl';

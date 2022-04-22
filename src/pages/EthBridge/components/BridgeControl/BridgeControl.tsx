import React from 'react';
import { Box } from 'grommet';
import { Text } from '../../../../components/Base';

interface Props {
  title: string | React.ReactNode;
  centerContent: React.ReactNode;
  bottomContent?: React.ReactNode;
  gap?: string;
}

export const BridgeControl: React.FC<Props> = ({
  title,
  centerContent,
  bottomContent,
  gap = '16px',
}) => {
  const isStringTitle = typeof title === 'string';

  return (
    <Box
      direction="column"
      gap={gap}
      justify="center"
      fill="horizontal"
      align="center"
    >
      <Box>
        {isStringTitle && (
          <Text size="xsmall" color="NGray">
            {title}
          </Text>
        )}
        {!isStringTitle && title}
      </Box>
      <Box fill="horizontal" align="center">
        {centerContent}
      </Box>
      {bottomContent && <Box>{bottomContent}</Box>}
    </Box>
  );
};

BridgeControl.displayName = 'BridgeControl';

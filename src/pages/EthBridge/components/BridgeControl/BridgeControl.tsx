import React from 'react';
import { Box } from 'grommet';
import { Text } from '../../../../components/Base';

interface Props {
  title: string | React.ReactNode;
  centerContent: React.ReactNode;
  bottomContent?: React.ReactNode;
  className?: string;
  gap?: string;
}

export const BridgeControl: React.FC<Props> = ({
  title,
  centerContent,
  bottomContent,
  className = '',
  gap = '16px',
}) => {
  const isStringTitle = typeof title === 'string';

  return (
    <Box
      className={className}
      direction="column"
      gap={gap}
      justify="center"
      fill="horizontal"
      align="center"
    >
      <Box>
        {isStringTitle && <Text size="xsmall">{title}</Text>}
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

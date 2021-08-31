import { Box } from 'grommet';
import React from 'react';
import { Text, Title } from './Base';

export function StatsBox({ header, title, stats }) {
  return (
    <Box
      background="white"
      pad="small"
      flex="grow"
      round="xxsmall"
      border={{
        color: '#e7ecf7',
      }}
    >
      <Title size="xxsmall">{header}</Title>
      <Box align="center" gap="xxsmall" margin={{ vertical: 'large' }}>
        <Text size="xlarge" bold>
          {stats}
        </Text>
        <Title size="xsmall">{title}</Title>
      </Box>
    </Box>
  );
}

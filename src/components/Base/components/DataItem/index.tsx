import * as React from 'react';
import { BoxProps, Box } from 'grommet';
import { Text } from '../Text';

export type TDataItemProps = BoxProps & {
  label: React.ReactNode;
  value: React.ReactNode;
  style?: object;
  bold?: boolean;
  url?: string;
  fileName?: string;
};

export const DataItem: React.FC<TDataItemProps> = ({ label, value, bold, ...boxProps }) => {
  return (
    <Box flex={{ shrink: 0 }} {...(boxProps as BoxProps)}>
      <Text size="xsmall" color="Black" style={{ paddingBottom: '6px' }}>
        {label}
      </Text>
      <Text size={bold ? 'medium' : 'small'} bold={bold} color="BlackTxt">
        {value}
      </Text>
    </Box>
  );
};
DataItem.displayName = 'DataItem';

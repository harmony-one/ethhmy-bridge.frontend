import * as React from 'react';
import { SorterIcon } from './SorterIcon';
import { Box } from 'grommet';

interface ISorterProps {
  dataIndex: string;
  sortable?: boolean;
  value?: sortType;
  onChange?: (type: sortType) => void;
}

export type sortType = 'none' | 'asc' | 'desc';

export const Sorter: React.FunctionComponent<ISorterProps> = props => {
  const { sortable, value, onChange } = props;

  if(!sortable) {
    return null;
  }

  return (
    <Box
      justify="center"
      align="center"
      margin={{ left: 'xsmall' }}
      onClick={() => {
        const newDirection = value === 'none'
          ? 'asc'
          : value === 'asc' ? 'desc' : 'none';

        onChange(newDirection);
      }}
    >
      <SorterIcon status={value} />
    </Box>
  );
};
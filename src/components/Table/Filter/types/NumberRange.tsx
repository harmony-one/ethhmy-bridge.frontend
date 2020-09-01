import * as React from 'react';
import { Box } from 'grommet';
import { useState } from 'react';
import { NumberInput, Text, Button } from 'components/Base';
import { CommonFilterBodyProps } from './common';

export const NumberRange: React.FunctionComponent<CommonFilterBodyProps> =
  ({ value, fieldName, onChange, onClose }) => {
  const { fromFilter, toFilter } = value || {};

  const [fromValue, setFrom] = useState<string>(fromFilter || '');
  const [toValue, setTo] = useState<string>(toFilter || '');

  const handleFilterChange = () => {
    onChange(fieldName, { fromFilter: fromValue, toFilter: toValue });

    onClose();
  };

  const onFilterChange = (value: string, edge: 'from' | 'to') => {
    edge === 'from' && setFrom(value);
    edge === 'to' && setTo(value);
  };

  const resetFilter = () => {
    onClose();
  };

  return (
    <Box>
      <Box pad={'small'} style={{ borderBottom: '1px solid #e7ecf7' }}>
        <Text size={'xsmall'} style={{ marginBottom: '8px' }} color="Basic500">
          Сумма, от (₽)
        </Text>
        <NumberInput
          value={fromValue}
          size="full"
          type="currency"
          placeholder="0,00"
          onChange={(value: string) => onFilterChange(value, 'from')}
          margin="0 0 16px 0"
        />
        <Text size={'xsmall'} style={{ marginBottom: '8px' }} color="Basic500">
          Сумма, до (₽)
        </Text>
        <NumberInput
          value={toValue}
          size="full"
          type="currency"
          placeholder="0,00"
          onChange={(value: string) => onFilterChange(value, 'to')}
        />
      </Box>
      <Box direction="row" justify="between" pad="small">
        <Button
          bgColor="Basic200"
          bgHoverColor="#F5F7FC"
          color="#30303d"
          fontSize="13px"
          size="small"
          padding="7px 16px"
          onClick={resetFilter}
        >
          Отменить
        </Button>
        <Button
          fontSize="13px"
          size="small"
          padding="7px 16px"
          onClick={handleFilterChange}
        >
          Применить
        </Button>
      </Box>
    </Box>
  );
};

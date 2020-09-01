import * as React from 'react';
import { Box } from 'grommet';
import { useState } from 'react';
import { Button, Icon, TextInput } from 'components/Base';
import { CommonFilterBodyProps } from './common';

export const SearchText: React.FunctionComponent<CommonFilterBodyProps> =
  ({ value, fieldName, onChange, onClose, placeholder = 'Найти...' }) => {

  const [searchText, setSearchText] = useState(value);

  const handleFilterChange = () => {
    onChange(fieldName, searchText);
    onClose();
  };

  const onSearchTextChange = (text: string) => {
    setSearchText(text);
  };

  const resetFilter = () => {
    onClose();
  };

  return (
    <Box>
      <Box
        pad={{ horizontal: 'xsmall', vertical: 'xsmall' }}
        style={{ borderBottom: '1px solid #e7ecf7' }}
      >
        <TextInput
          value={searchText}
          size="full"
          onChange={onSearchTextChange}
          bgColor="transparent"
          border="none"
          placeholder={placeholder}
          renderLeft={<Icon glyph="Search" size="16px" color="Basic300" />}
          renderRight={
            <div
              onClick={() => setSearchText('')}
              style={{ cursor: 'pointer' }}
            >
              <Icon glyph="Close" size="16px" color="Basic300" />
            </div>
          }
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
          padding="0 16px"
          onClick={handleFilterChange}
        >
          Применить
        </Button>
      </Box>
    </Box>
  );
};

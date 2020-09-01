import * as React from 'react';
import { Box } from 'grommet';
import { useState, useEffect } from 'react';
// import { getProposalFilterOptions } from 'services/suggestionService';
import { Icon, TextInput, Checkbox } from 'components/Base';
import styled from 'styled-components';
import { Spinner } from '../../Spinner';
import { CommonFilterBodyProps } from './common';

export const isDefined = (value: any) => value !== null && value !== undefined;

const OptionRow = styled(Box)`
  flex: 0 0 auto;
  padding: 6px 6px 6px 24px;

  &:hover {
    background-color: #f5f7fc;
  }
`;

function filterSearch(
  option: string,
  searchText: string,
  renderMap: Record<string, string>,
  normalize?: (v: string) => string
) {
  let optionText = renderMap ? renderMap[option] : option;
  optionText = normalize ? normalize(option) : optionText;

  return !searchText || String(optionText).toLowerCase().indexOf(searchText.toLowerCase()) > -1;
}

export const CheckboxOptions: React.FunctionComponent<
  CommonFilterBodyProps & {
    normalize?: (v: string) => string;
  }
> = ({ value, fieldName, renderMap, normalize, onChange, renderOptions }) => {
  const [filters, setFilters] = useState<string[]>(value || []);
  const [searchText, setSearchText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [allOptions, setAllOptions] = useState<string[]>([]);
  const { checkboxOptionsPromise } = renderOptions;

  useEffect(() => {
    checkboxOptionsPromise(fieldName)
      .then(options => {
        setAllOptions(options.filter(i => isDefined(i)));
      })
      //@ts-ignore
      .finally(() => setIsLoading(false));
  }, [fieldName]);

  const handleFilterChange = (options: string[]) => {
    setFilters(options);
    onChange(fieldName, options);
  };

  const onSearchTextChange = (text: string) => {
    setSearchText(text);
  };

  if (isLoading) {
    return (
      <Box
        style={{ flex: '1 0 auto', height: '100%', minHeight: '244px' }}
        justify="center"
        align="center"
      >
        <Spinner style={{ width: 24, height: 24 }} color="#4740A1" />
      </Box>
    );
  }

  const onCheckChange = (checked: boolean, value: string) => {
    if (checked) {
      handleFilterChange(filters.concat([value]));
    } else {
      handleFilterChange(filters.filter(v => v !== value));
    }
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
          placeholder="Найти в списке"
          renderLeft={<Icon glyph="Search" size="16px" color="Basic300" />}
          renderRight={
            <Icon glyph="Close" size="16px" onClick={() => setSearchText('')} color="Basic300" />
          }
        />
      </Box>

      <Box style={{ height: '174px', overflow: 'auto' }}>
        {allOptions
          .filter(option => filterSearch(option, searchText, renderMap, normalize))
          .map(value => (
            <OptionRow direction="row" key={value}>
              <Checkbox
                value={filters.includes(value)}
                size="full"
                name={fieldName}
                label={renderMap ? renderMap[value] : normalize ? normalize(value) : value}
                onChange={(checked: boolean) => onCheckChange(checked, value)}
              />
            </OptionRow>
          ))}
      </Box>
    </Box>
  );
};

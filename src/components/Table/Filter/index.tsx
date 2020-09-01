import * as React from 'react';
import { CheckboxOptions, NumberRange, SearchText } from './types';
import { useState } from 'react';
import { withTheme } from 'styled-components';
import { FilterWrap, FilterModal } from './components';
import { Icon } from 'components/Base';
import { ITableOptions } from '../';

interface IFilterProps {
  column: any;
  value: any;
  onChange: (index: string, value: any) => void;
  updateManyFilters: (updatedFilters: Record<string, unknown>) => void;
  theme?: any;
  options: ITableOptions;
}

const FilterC: React.FunctionComponent<IFilterProps> = props => {
  const { column, theme, value, onChange, updateManyFilters, options } = props;
  const { filter } = column;
  const [isOpenFilter, setOpenFilter] = useState(false);
  const refContainer = React.useRef<HTMLDivElement>(null);

  if (!filter) {
    return null;
  }

  const switchFilterModal = () => {
    setOpenFilter(!isOpenFilter);
  };

  const {
    name,
    type,
    textMap,
    normalize,
    placeholder,
    position = 'bottomRight',
  }: any = filter;

  const getFilterBody = () => {
    if (filter.render) return filter.render;

    switch (type) {
      case 'select':
        return CheckboxOptions;
      case 'search':
        return SearchText;
      case 'numberRange':
        return NumberRange;
    }
  };

  const hasActiveFilter = !!value;

  const FilterBody = getFilterBody();

  return (
    <>
      <FilterWrap ref={refContainer}>
        <Icon
          onClick={switchFilterModal}
          glyph="Filter2"
          size="14px"
          color={
            hasActiveFilter ? theme.palette.Basic800 : theme.palette.Basic400
          }
        />
      </FilterWrap>
      {isOpenFilter && (
        <FilterModal
          ref={refContainer}
          position={position}
          onClose={() => setOpenFilter(false)}
        >
          <>
            <FilterBody
              value={value}
              renderOptions={options}
              onChange={onChange}
              placeholder={placeholder}
              fieldName={name}
              renderMap={textMap}
              normalize={normalize}
              onClose={() => setOpenFilter(false)}
              updateManyFilters={updateManyFilters}
            />
          </>
        </FilterModal>
      )}
    </>
  );
};

export const Filter = withTheme(FilterC);

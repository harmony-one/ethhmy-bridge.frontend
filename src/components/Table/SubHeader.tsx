import * as React from 'react';
import { Box } from 'grommet';
import { Icon } from 'components/Base';
import styled from 'styled-components';
import { isFilterApplied } from './utils/filters';

const FilterCounterBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: #f5f7fc;
  border-radius: 4px;

  div {
    color: #30303d;
    font-size: 13px;
    margin-right: 12px;
    font-weight: normal;

    span {
      font-weight: 600;
    }
  }
`;

export function SubHeader(props: {
  onChange: (dataIndex: string) => void;
  column: any;
  filter: any;
  updateManyFilters: any;
}) {
  const { filter, onChange, column, updateManyFilters } = props;
  const { dataIndex } = column;

  const isActiveFilter = column.filter?.isApplied
    ? column.filter.isApplied()
    : isFilterApplied(filter);

  const removeFilter = () => {
    if (typeof column.filter?.resetButton?.onClick === 'function') {
      column.filter.resetButton.onClick({ updateManyFilters });
    } else {
      onChange(dataIndex);
    }
  };

  const renderText = () => {
    if (!!column.filter?.resetButton?.renderText) {
      const CustomText = column.filter.resetButton.renderText;
      return <CustomText />;
    }

    if (filter instanceof Array)
      return (
        <div>
          Выбрано: <span>{filter.length}</span>
        </div>
      );

    return <div>Применен</div>;
  };

  return (
    <Box
      direction="row"
      justify="start"
      align="center"
      margin={{ top: 'xsmall' }}
      style={{ visibility: isActiveFilter ? 'visible' : 'hidden' }}
    >
      <FilterCounterBar onClick={removeFilter}>
        {renderText()}
        <Icon glyph="Close" color="#30303d" size="12px" />
      </FilterCounterBar>
    </Box>
  );
}

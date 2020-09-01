import { Text } from 'components/Base';
import { Sorter, sortType } from './Sorter';
import { Filter } from './Filter';
import { SubHeader } from './SubHeader';
import * as React from 'react';

interface IValueProps {
  fromFilter?: string;
  toFilter?: string;
}

interface IHeaderProps {
  [name: string]: any;
}

interface IFilters {
  [name: string]: any;
}

function getFilterByKey(key: string, filters: IFilters) {
  const fromFilter = filters[key + 'From'] || null;
  const toFilter = filters[key + 'To'] || null;
  if (fromFilter || toFilter) {
    return { fromFilter, toFilter };
  }

  return filters[key];
}

function getSorterValue(sorter: any, dataIndex: string): sortType {
  if (sorter && sorter.includes(dataIndex)) {
    return (sorter.split(',')[1] as sortType) || 'none';
  }

  return 'none';
}

export const CustomHeader = (props: IHeaderProps) => {
  const { title, column, dataLayerConfig, onChangeDataFlow, options, hasAnyActiveFilter } = props;
  const { dataIndex, sortable } = column;
  const { filters = {}, sorter, sorters = {} } = dataLayerConfig;
  const filter = getFilterByKey(dataIndex, filters);
  const sorterValue = getSorterValue(sorter, dataIndex);

  const removeFilterByKey = (key: string) => {
    const { type } = column.filter || {};
    let newValue = { [key]: undefined } as any;

    switch (type) {
      case 'numberRange':
      case 'dateRange':
        newValue = { [key + 'From']: undefined, [key + 'To']: undefined };
        break;
      case 'select':
        newValue = { [key]: [] };
    }

    onChangeDataFlow({
      filters: { ...filters, ...newValue },
    });
  };

  const updateFilterByKey = (key: string, value: string | string[] | IValueProps) => {
    const { type } = column.filter || {};
    let newValue = { [key]: value } as any;

    switch (type) {
      case 'numberRange':
      case 'dateRange':
        const { fromFilter, toFilter } = value as IValueProps;
        newValue = { [key + 'From']: fromFilter, [key + 'To']: toFilter };
        break;
      case 'select':
        newValue = { [key]: value };
    }

    onChangeDataFlow({
      filters: { ...filters, ...newValue },
    });
  };

  const updateManyFilters = (updatedFilters: Record<string, unknown>) => {
    onChangeDataFlow({
      filters: { ...filters, ...updatedFilters },
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex' }}>
        <Text>{title}</Text>
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            flex: '0 0 auto',
          }}
        >
          <Sorter
            sortable={sortable}
            value={sorterValue}
            dataIndex={dataIndex}
            onChange={sortType => {
              onChangeDataFlow({
                sorters: { ...sorters, [dataIndex]: sortType },
                sorter: sortType !== 'none' ? `${dataIndex},${sortType}` : 'none',
              });
            }}
          />
          <Filter
            column={column}
            value={filter}
            onChange={updateFilterByKey}
            updateManyFilters={updateManyFilters}
            options={options}
          />
        </div>
      </div>
      {hasAnyActiveFilter && (
        <SubHeader
          filter={filter}
          column={column}
          onChange={removeFilterByKey}
          updateManyFilters={updateManyFilters}
        />
      )}
    </div>
  );
};

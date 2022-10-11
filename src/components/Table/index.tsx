import * as React from 'react';
import { observer } from 'mobx-react';
import { computed, observable } from 'mobx';
import RcTable from 'rc-table';
import { Spinner } from './Spinner';
import 'rc-table/assets/index.css';
import { CustomPagination, PaginationType } from './CustomPagination';
import { CustomHeader } from './CustomHeader';
import styled from 'styled-components';
import { isFilterApplied } from './utils/filters';

import './styles.styl';
import { TableProps } from 'rc-table/es/Table';
import { Box } from 'grommet';

const LoaderWrap = styled.div`
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 2;
`;

export interface IColumn<P = any> {
  title?: string | React.ReactNode;
  width: number | string;
  sortable?: boolean;
  dataIndex?: keyof P;
  key: keyof P;
  render?: (value: any, data: P) => React.ReactNode;
  defaultSort?: string;
  filter?: any;
  align?: string;
  className?: string;
}

interface IProps {
  data?: any[];
  columns: IColumn[];
  tableParams?: TableProps;
  theme?: any;
  dataLayerConfig?: any;
  isPending?: boolean;
  paginationType?: PaginationType;
  hidePagination?: boolean;
  onChangeDataFlow?: (props: any) => void;
  onRowClicked?: (rowData: any, index: number) => any;
  options?: ITableOptions;
  scroll?: { x?: string | number; y?: string | number };
  customItem?: {
    render:
      | React.FunctionComponent<{ params: any }>
      | React.ComponentClass<{ params: any }>;
    bodyStyle?: any;
    bodyClassName?: string;
    dir?: 'row' | 'column';
    wrap?: 'wrap' | 'no-wrap';
    wrapMargin?: string;
  };
}

export interface ITableOptions {
  checkboxOptionsPromise: (
    fieldName: string,
    params?: any,
  ) => Promise<string[]>;
}

@observer
export class Table extends React.Component<IProps> {
  @observable isLoading: boolean = false;

  hasAnyActiveFilter = () => {
    const { columns, dataLayerConfig } = this.props;

    const { filters = {} } = dataLayerConfig;

    return Object.entries(filters).some(([dataIndex, value]) => {
      const columnConfig = columns.find(c => c.dataIndex === dataIndex);

      if (typeof columnConfig?.filter?.isApplied === 'function') {
        return columnConfig.filter.isApplied(value);
      }

      return isFilterApplied(value);
    });
  };

  @computed
  private get columns() {
    const {
      columns,
      dataLayerConfig,
      onChangeDataFlow,
      options = {},
    } = this.props;

    const hasAnyActiveFilter = this.hasAnyActiveFilter();

    return columns.map(column => {
      const { title } = column;

      return {
        ...column,
        title: (
          <CustomHeader
            dataLayerConfig={dataLayerConfig}
            hasAnyActiveFilter={false}
            title={title}
            column={column}
            options={options}
            onChangeDataFlow={onChangeDataFlow}
          />
        ),
      };
    });
  }

  componentDidMount() {
    const { columns, dataLayerConfig, onChangeDataFlow } = this.props;
    const sorter = columns
      .filter(col => col.defaultSort)
      .map(col => `${String(col.key)},${col.defaultSort}`);
    onChangeDataFlow({ ...dataLayerConfig, sorter });
  }

  renderPagination() {
    const {
      hidePagination,
      paginationType,
      onChangeDataFlow,
      dataLayerConfig,
    } = this.props;
    const { paginationData } = dataLayerConfig;

    if (hidePagination) {
      return null;
    }

    return (
      <Box pad={{ vertical: '32px' }}>
        <CustomPagination
          showSizer={false}
          type={paginationType}
          config={paginationData}
          onChange={config => {
            onChangeDataFlow({ paginationData: config });
          }}
          activeColor="NGray3"
        />
      </Box>
    );
  }

  render() {
    const {
      data,
      onRowClicked,
      isPending,
      tableParams,
      scroll = {},
      customItem,
    } = this.props;

    const ItemRender = customItem ? customItem.render : null;

    return (
      <div style={{ position: 'relative', width: '100%' }}>
        {isPending && (
          <LoaderWrap>
            <Spinner style={{ width: 24, height: 24 }} />
          </LoaderWrap>
        )}
        {customItem ? (
          <div
            style={
              customItem.bodyStyle || customItem.bodyClassName
                ? customItem.bodyStyle
                : {
                    display: 'flex',
                    flexDirection: customItem.dir || 'column',
                    flexWrap: customItem.wrap || 'no-wrap',
                    justifyContent: 'flex-start',
                    alignItems: 'flex-start',
                    margin: customItem.wrapMargin
                      ? `-${customItem.wrapMargin} 0 0 -${customItem.wrapMargin}`
                      : '0',
                    width: customItem.wrapMargin
                      ? `calc(100% + 2 * ${customItem.wrapMargin})`
                      : 'auto',
                  }
            }
            className={customItem.bodyClassName}
          >
            {data.map((item, idx) => (
              <ItemRender key={item.id || idx} params={item} />
            ))}
          </div>
        ) : (
          <RcTable
            {...tableParams}
            data={data}
            columns={this.columns as any}
            emptyText="No data"
            scroll={scroll}
            onRow={(rowData, index) => {
              return {
                onClick: () =>
                  onRowClicked instanceof Function &&
                  onRowClicked(rowData, index),
                style: {
                  cursor: onRowClicked instanceof Function ? 'pointer' : 'auto',
                },
              };
            }}
          />
        )}
        {this.renderPagination()}
      </div>
    );
  }
}

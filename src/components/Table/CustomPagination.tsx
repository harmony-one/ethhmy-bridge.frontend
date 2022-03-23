import * as React from 'react';
import { Select } from 'components/Base';
import { observer } from 'mobx-react';
import styled from 'styled-components';
import { Box } from 'grommet';
import { Pager, PagerSimple } from './Pager';

export enum PaginationType {
  PAGING = 'paging',
  DEFAULT = 'default',
}

interface IPaginationPanelProps {
  showPages?: boolean;
  showSizer?: boolean;
  activeColor?: string;
  theme?: any;
  type?: PaginationType;
  config: IPaginationConfig;
  onChange?: (props: any) => void;
}

interface IPaginationConfig {
  currentPage?: number;
  totalPages?: number;
  pageSize?: number;
  totalElements?: number;
}

const options = [
  { text: '10 items', value: 10 },
  { text: '30 items', value: 30 },
  { text: '50 items', value: 50 },
  { text: '100 items', value: 100 },
];

@observer
export class CustomPagination extends React.Component<IPaginationPanelProps> {
  onPageSizeChanged = (value: number) => {
    const { config, onChange } = this.props;

    onChange({
      ...config,
      pageSize: value,
    });
  };

  goToPage = (value: number) => {
    const { config, onChange } = this.props;
    onChange({
      ...config,
      currentPage: value,
    });
  };

  renderPager() {
    const { activeColor, config, type } = this.props;
    const { currentPage, totalElements, pageSize, totalPages } = config;

    const hasNext = totalElements === pageSize || totalPages > currentPage;

    if (type === PaginationType.PAGING) {
      return (
        <PagerSimple
          current={currentPage}
          hasNext={hasNext}
          hasPrev={currentPage > 1}
          goToPage={this.goToPage}
        />
      );
    }

    return (
      <Pager
        current={currentPage}
        total={totalPages}
        offset={2}
        activeColor={activeColor}
        goToPage={this.goToPage}
      />
    );
  }

  render() {
    const { config, showPages = true, showSizer = true } = this.props;
    const { pageSize } = config;

    return (
      <Box direction="row" justify="center" align="center">
        {showPages && this.renderPager()}

        {showSizer && (
          <Box width="164px">
            <Select
              name="pageSize"
              type="filter"
              value={pageSize}
              size="full"
              options={options}
              onChange={this.onPageSizeChanged}
            />
          </Box>
        )}
      </Box>
    );
  }
}

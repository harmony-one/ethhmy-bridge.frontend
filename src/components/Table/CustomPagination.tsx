import * as React from 'react';
import { Select } from 'components/Base';
import { observer } from 'mobx-react';
import styled from 'styled-components';
import { Box } from 'grommet';
import { Pager, PagerSimple } from './Pager';

interface IPaginationPanelProps {
  activeColor?: string;
  theme?: any;
  type?: 'paging' | 'default';
  config: IPaginationConfig;
  onChange?: (props: any) => void;
}

interface IPaginationConfig {
  currentPage?: number;
  totalPages?: number;
  pageSize?: number;
  totalElements?: number;
}

const PaginationWrap = styled.div<any>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32px 0;
`;

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

  renderPaper() {
    const { activeColor, config, type } = this.props;
    const { currentPage, totalElements, pageSize, totalPages } = config;

    const hasNext = totalElements === pageSize || totalPages > currentPage;

    if (type === 'paging') {
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
    const { config } = this.props;
    const { pageSize } = config;

    return (
      <PaginationWrap>
        {this.renderPaper()}
        <Box width="266px">
          <Select
            name="pageSize"
            type="filter"
            value={pageSize}
            size="full"
            options={[
              { text: 'Show 10 items', value: 10 },
              { text: 'Show 30 items', value: 30 },
              { text: 'Show 50 items', value: 50 },
              { text: 'Show 100 items', value: 100 },
            ]}
            onChange={this.onPageSizeChanged}
          />
        </Box>
      </PaginationWrap>
    );
  }
}

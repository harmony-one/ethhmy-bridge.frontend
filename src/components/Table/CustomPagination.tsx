import * as React from 'react';
import { Select } from 'components/Base';
import { observer } from 'mobx-react';
import styled from 'styled-components';
import { Box } from 'grommet';
import { Pager } from './Pager';

interface IPaginationPanelProps {
  activeColor?: string;
  theme?: any;
  config: IPaginationConfig;
  onChange?: (props: any) => void;
}

interface IPaginationConfig {
  currentPage?: number;
  totalPages?: number;
  pageSize?: number;
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

  render() {
    const { activeColor, config } = this.props;
    const { currentPage, totalPages, pageSize } = config;

    return (
      <PaginationWrap>
        <Pager
          current={currentPage}
          total={totalPages}
          offset={2}
          activeColor={activeColor}
          goToPage={this.goToPage}
        />
        <Box width="266px">
          <Select
            name="pageSize"
            type="filter"
            value={pageSize}
            size="full"
            options={[
              { text: 'Показать 10 документов', value: 10 },
              { text: 'Показать 30 документов', value: 30 },
              { text: 'Показать 50 документов', value: 50 },
              { text: 'Показать 100 документов', value: 100 },
            ]}
            onChange={this.onPageSizeChanged}
          />
        </Box>
      </PaginationWrap>
    );
  }
}

import * as React from 'react';
import styled from 'styled-components';
import { Button } from '../Base';
import { useCallback } from 'react';
import { Box } from 'grommet';

interface IPagerProps {
  current: number;
  total: number;
  offset?: number;
  goToPage(page: number): void;
  theme?: object;
  activeColor?: string;
}

type TPAGECLICKER = 'default' | 'active' | 'dots';

interface IPageClickerProps {
  text: string;
  type: TPAGECLICKER;
  value: number;
  onClick?(page: number): void;
  theme?: object;
  activeColor?: string;
}

const PagerWrap = styled.div<any>`
  display: flex;
`;

function generatePageList(
  current: number,
  total: number,
  offset: number,
): IPageClickerProps[] {
  let pageList: IPageClickerProps[] = [];

  if (current < 1) {
    current = 1;
  }

  if (total < 1) {
    total = 1;
  }

  if (offset < 1) {
    offset = 1;
  }

  // first page
  if (current !== 1) {
    pageList.push({
      text: String(1),
      type: 'default',
      value: 1,
    });
  }

  // left dots fault
  if (current - offset > 1) {
    pageList.push({
      text: '...',
      type: 'dots',
      value: -1,
    });
  }

  // left offset part
  let placedLeftOffset = 1;
  const leftOffset = [];
  while (current - placedLeftOffset > 1 && placedLeftOffset <= offset) {
    leftOffset.push({
      text: String(current - placedLeftOffset),
      type: 'default',
      value: current - placedLeftOffset,
    });
    placedLeftOffset++;
  }
  leftOffset.reverse();
  pageList = pageList.concat(leftOffset as any[]);

  // current active page
  pageList.push({
    text: String(current),
    type: 'active',
    value: current,
  });

  // right offset part
  let placedRightOffset = 1;
  while (current + placedRightOffset < total && placedRightOffset <= offset) {
    pageList.push({
      text: String(current + placedRightOffset),
      type: 'default',
      value: current + placedRightOffset,
    });
    placedRightOffset++;
  }

  // right dots fault
  if (total - current > offset) {
    pageList.push({
      text: '...',
      type: 'dots',
      value: -2,
    });
  }

  // last page
  if (current !== total) {
    pageList.push({
      text: String(total),
      type: 'default',
      value: total,
    });
  }

  return pageList;
}

interface IPagerSimpleProps {
  current: number;
  hasNext: boolean;
  hasPrev: boolean;
  goToPage(page: number): void;
}

export const PagerSimple: React.FunctionComponent<IPagerSimpleProps> = props => {
  const { hasPrev, hasNext, current, goToPage } = props;

  const handleGoPrev = useCallback(() => {
    goToPage(current - 1);
  }, [current, goToPage]);

  const handleGoNext = useCallback(() => {
    goToPage(current + 1);
  }, [current, goToPage]);

  return (
    <Box direction="row" gap="xsmall">
      <Button
        disabled={!hasPrev}
        pad="12px"
        size="auto"
        fontSize="16px"
        onClick={handleGoPrev}
      >
        prev
      </Button>
      <Button
        disabled={!hasNext}
        pad="12px"
        size="auto"
        fontSize="16px"
        onClick={handleGoNext}
      >
        next
      </Button>
    </Box>
  );
};

export const Pager: React.FunctionComponent<IPagerProps> = props => {
  const { current, offset = 2, total, goToPage, activeColor } = props;
  const pageList = generatePageList(current, total, offset);

  return (
    <PagerWrap>
      {pageList.map(page => (
        <PagerCell
          key={page.value}
          {...page}
          activeColor={activeColor}
          onClick={goToPage}
        />
      ))}
    </PagerWrap>
  );
};

function getBgColor(props: any) {
  const { type, theme, activeColor } = props;
  if (type === 'dots') {
    return 'transparent';
  }
  if (type === 'active') {
    return theme.palette[activeColor] || theme.palette.Purple500 || activeColor;
  }

  return 'transparent';
}

const StyledPageCell = styled.div<any>`
  display: flex;
  justify-content: center;
  align-items: center;

  height: 46px;
  width: 46px;
  border-radius: 15px;
  border: ${props =>
    `4px solid ${
      props.type === 'active' ? props.theme.palette.NWhite : 'transparent'
    }`};
  background-color: ${getBgColor};
  color: ${props =>
    props.type === 'active'
      ? props.theme.palette.NBlack
      : props.theme.palette.NWhite};
  cursor: ${props => (props.type === 'default' ? 'pointer' : 'auto')};
  margin-right: 8px;
  font-size: 14px;
`;

const PagerCell: React.FunctionComponent<IPageClickerProps> = props => {
  const { text, value, type, onClick, theme, activeColor } = props;

  return (
    <StyledPageCell
      type={type}
      activeColor={activeColor}
      onClick={() => type === 'default' && onClick(value)}
      theme={theme}
    >
      {text}
    </StyledPageCell>
  );
};

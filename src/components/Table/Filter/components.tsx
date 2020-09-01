import styled from 'styled-components';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import OutsideClickHandler from 'react-outside-click-handler';

const positions: Record<ModalPosition, PositinPreset> = {
  bottomRight: {
    top: (rect: DOMRect) => rect.top + rect.height / 2 + 14,
    left: (rect: DOMRect) => rect.left - 240,
    arrowShift: 'calc(100% - 44px)',
  },
  bottomCenter: {
    top: (rect: DOMRect) => rect.top + rect.height / 2 + 14,
    left: (rect: DOMRect) => rect.left - 144,
    arrowShift: `calc(50% + 3px)`,
  },
};

type ModalPosition = 'bottomRight' | 'bottomCenter';

type PositinPreset = {
  top: (rect: DOMRect) => number;
  left: (rect: DOMRect) => number;
  arrowShift: string;
};

export const FilterWrap = styled.div`
  display: flex;
  align-items: center;
  position: relative;
`;

type ModalWrapProps = {
  bounds: DOMRect;
  hasActiveFilter: boolean;
  position: ModalPosition;
};

const FilterModalWrap = styled.div<ModalWrapProps>`
  position: absolute;
  width: 288px;
  height: auto;
  top: ${props => positions[props.position].top(props.bounds)}px;
  left: ${props => positions[props.position].left(props.bounds)}px;
  border: 1px solid ${props => props.theme.palette.Basic300};
  z-index: 5;
  background-color: white;
  border-radius: 4px;

  &:before {
    content: ' ';
    position: absolute;
    top: -16px;
    left: ${props => positions[props.position].arrowShift};
    border: 8px solid transparent;
    border-bottom: 8px solid ${props => props.theme.palette.Basic300};
  }

  &:after {
    content: ' ';
    position: absolute;
    top: -14px;
    left: ${props => positions[props.position].arrowShift};
    border: 8px solid transparent;
    border-bottom: 8px solid white;
  }

  > div {
    height: 100%;
    flex: 1 0 auto;
  }
`;

type FilterModalProps = {
  onClose: () => void;
  hasActiveFilter?: boolean;
  position: ModalPosition;
  children: JSX.Element;
};

export interface CommonFilterBodyProps {
  fieldName: string;
  renderMap?: Record<string, string>;
  onClose: () => any;
  placeholder?: string;
}

export const FilterModal = React.forwardRef(
  (props: FilterModalProps, ref: React.MutableRefObject<HTMLDivElement>) => {
    const { children, onClose, hasActiveFilter, position } = props;

    if (!ref.current) {
      return null;
    }

    const bounds = ref.current.getBoundingClientRect();

    return ReactDOM.createPortal(
      <FilterModalWrap
        position={position}
        bounds={bounds}
        hasActiveFilter={hasActiveFilter}
      >
        <OutsideClickHandler onOutsideClick={onClose}>
          {children}
        </OutsideClickHandler>
      </FilterModalWrap>,
      document.body,
    );
  },
);

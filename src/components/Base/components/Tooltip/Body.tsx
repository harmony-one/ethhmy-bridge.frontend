import * as React from 'react';
import * as ReactDOM from 'react-dom';
import styled from 'styled-components';

interface IPosition {
  top: number;
  left: number;
}

interface ITooltipProps {
  text?: string;
  isShown?: boolean;
  position: IPosition;
  offset?: number;
  renderType?: 'default' | 'portal';
}

class TooltipBody extends React.Component<ITooltipProps> {
  el: any;

  getStyledPosition() {
    const { position, text } = this.props;
    const actualWidth = text.length * 8 + 20;

    return { top: `${position.top - 50}px`, left: `${position.left - 0.5 * actualWidth}px` };
  }
  render() {
    const { text, isShown, offset, renderType = 'default' } = this.props;

    if (!isShown) {
      return null;
    }

    if (renderType === 'default') {
      return <Tooltip>{text}</Tooltip>;
    }

    return ReactDOM.createPortal(
      <Tooltip style={this.getStyledPosition()} offset={offset}>
        {text}
      </Tooltip>,
      document.body
    );
  }
}

export { TooltipBody };

const Tooltip = styled.div<any>`
  position: absolute;
  bottom: 35px;
  left: calc(-100% - 18px);
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  border-radius: 4px;
  padding: 10px;

  z-index 999;
  width: 240px;
  max-width: 240px;
  
  &:after {
    position: absolute;
    content: '';
    top: 100%;
    left: ${props => `calc(50% - ${props.offset || 8}px)`};
    width: 0;
    height 8px;
    border: 8px solid rgba(0, 0, 0, 0.8);
    border-left-color: transparent;
    border-right-color: transparent;
    border-bottom-color: transparent;
  }
`;

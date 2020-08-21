import { observable } from 'mobx';
import { observer } from 'mobx-react';
import 'rc-tooltip/assets/bootstrap_white.css';
import * as React from 'react';
import styled, { withTheme } from 'styled-components';

import './styles.scss';

import { TooltipBody } from './Body';

const RCTooltip: any = require('rc-tooltip');

@observer
class TooltipClass extends React.Component<ITooltipProps> {
  @observable isShown: boolean;
  private elementRef: any;
  private tId: number | any;

  getPosition() {
    if (this.elementRef) {
      const { top, left } = this.elementRef.getBoundingClientRect();
      const actualWidth = this.elementRef.offsetWidth;
      return { top, left: left + 0.5 * actualWidth };
    }

    return { top: '50%', left: '50%' };
  }

  onMouseEnter = () => {
    const { showDelay = 0 } = this.props;
    if (this.tId) {
      return null;
    }
    if (!showDelay) {
      return (this.isShown = true);
    }

    this.tId = setTimeout(() => (this.isShown = true), showDelay);

    return null;
  };

  render() {
    const { children, text, offset, renderType = 'default', theme = {} } = this.props;

    if (!text) {
      return children;
    }

    if (renderType === 'default') {
      return (
        <RCTooltip overlay={<Overlay theme={theme}>{text}</Overlay>} placement="top">
          {children}
        </RCTooltip>
      );
    }

    return (
      <TooltipExample
        ref={ref => (this.elementRef = ref)}
        onMouseEnter={this.onMouseEnter}
        onMouseLeave={() => {
          if (this.tId) {
            clearTimeout(this.tId);
            this.tId = null;
          }

          this.isShown = false;
        }}
      >
        {children}
        <TooltipBody
          text={text}
          isShown={this.isShown}
          position={this.getPosition()}
          offset={offset}
          renderType={renderType}
        />
      </TooltipExample>
    );
  }
}

const TooltipExample = styled.div<any>`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  color: ${props => props.theme.textColor};
  border-color: ${props => props.theme.textColor};
`;

const Overlay = styled.div<any>`
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  border-radius: 4px;
  padding: 10px;

  z-index 999;
  max-width: 240px;
  
  font-family: ${props => props.theme.fontBase || '"Roboto-Medium", sans-serif'};
  font-size: 15px;
`;

export interface ITooltipProps {
  text?: string;
  showDelay?: number;
  offset?: number;
  theme?: any;
  renderType?: 'default' | 'portal';
}

export const Tooltip: React.ComponentType<ITooltipProps> = withTheme(TooltipClass);
Tooltip.displayName = 'Tooltip';

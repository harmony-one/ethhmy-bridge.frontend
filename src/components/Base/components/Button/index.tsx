import { observable } from 'mobx';
import { observer } from 'mobx-react';
import { lighten } from 'polished';
import * as React from 'react';
import styled, { withTheme } from 'styled-components';
import { BlockChainLoader } from '../BlockChainLoader';
import { Col, Row } from '../Layout';
import { getSize } from '../Inputs/common';

import { TEdgeSize, getMarginCSS, getPaddingCSS } from '../../utils';

type TButtonSize = 'small' | 'medium' | 'large' | 'xlarge' | 'xxlarge' | 'full' | 'auto';
type TBtnType = 'default' | 'href';

interface IConfirmProps {
  text: string;
  okBtnText: string;
  cancelBtnText?: string;
}

interface IButtonProps {
  btnType?: TBtnType;
  className?: string;
  isLoading?: boolean;
  disabled?: boolean;
  transparent?: boolean;
  bordered?: boolean;
  theme?: any;
  size?: TButtonSize;
  margin?: TEdgeSize;
  pad?: TEdgeSize;
  style?: React.CSSProperties;
  confirmOnClick?: IConfirmProps;
  padding?: string;
  color?: string;
  bgColor?: string;
  bgHoverColor?: string;
  fontSize?: string;
  onClick?(): any | Promise<any>;
  onError?(message: string): any;
}

function getButtonTextColor(props: any) {
  const { transparent, bordered, theme, color } = props;

  if (!transparent) {
    return theme.palette[color] || color || theme.styled.colors.buttonColor;
  }

  if (transparent && !bordered) {
    return theme.palette[color] || color || theme.textInverseColor;
  }

  return theme.palette[color] || color || theme.styled.colors.colorPrimary;
}

function getButtonBgColor(props: any) {
  const { theme, transparent, bgColor } = props;

  if (transparent) {
    return 'transparent';
  }

  return theme.palette[bgColor] || bgColor || theme.styled.colors.buttonBgColor;
}

interface IStyledButtonProps {
  fontSize?: string;
  size?: TButtonSize;
  bordered?: boolean;
  bgHoverColor?: string;
  transparent?: boolean;

  margin?: TEdgeSize;
  pad?: TEdgeSize;
}

const StyledLoader = styled(BlockChainLoader)`
  position: absolute;

  height: 100%;
  width: 100%;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 4px;
`;

const StyledButton = styled.button<IStyledButtonProps & any>`
  position: relative;
  padding: ${props => props.theme.styled.button.padding || ''};
  border-radius: 4px;
  font-family: ${props => props.theme.fontBase};
  font-size: ${props => props.fontSize || '18px'};
  letter-spacing: 0.5px;
  line-height: 16px;
  width: ${props => getSize(props.size, props.theme)};
  text-align: center;
  font-weight: 500;
  border: ${props => (props.bordered ? props.theme.styled.button.border : 'none')};

  display: flex;
  justify-content: center;
  outline: none;
  box-sizing: border-box;
  cursor: ${props => (props.disabled ? 'auto' : 'pointer')};
  opacity: ${props => (props.disabled ? 0.5 : 1)};

  ${props => props.margin && getMarginCSS(props.margin, props.theme)}
  ${props => props.pad && getPaddingCSS(props.pad, props.theme)}

  &, ${StyledLoader} {
    background-color: ${getButtonBgColor};
    color: ${getButtonTextColor};
  }

  &:hover {
    background-color: ${props =>
      props.bgHoverColor || lighten(props.disabled ? 0 : 0.07, getButtonBgColor(props))};
    color: ${props => lighten(props.disabled ? 0 : 0.07, getButtonTextColor(props))};
  }
`;

const Content = styled.div<any>`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const TooltipWrap = styled(Col)<any>`
  position: absolute;
  top: ${props => props.position.top}px;
  right: ${props => props.position.right}px;
  z-index: 999;
  width: 285px;
  background-color: white;
  padding: 24px;
  border-top: 4px solid ${props => props.theme.styled.colors.colorPrimary};
  border-radius: 4px;
  color: ${props => props.theme.textColor};

  * {
    font-family: ${props => props.theme.fontBase};
  }

  &:after {
    content: ' ';
    position: absolute;
    top: -20px;
    right: 17px;
    border: 8px solid transparent;
    border-bottom: 8px solid ${props => props.theme.styled.colors.colorPrimary};
  }
`;

@observer
class ButtonClass extends React.Component<IButtonProps> {
  @observable isLoading: boolean = false;
  @observable isConfirmTooltipOpen: boolean = false;

  onClick = () => {
    const { onClick, onError } = this.props;

    if (!(onClick instanceof Function)) {
      return null;
    }

    const promise = onClick();

    if (promise instanceof Promise) {
      // this.isLoading = true;

      return promise
        .then((res: any) => {
          this.isLoading = false;
        })
        .catch(err => {
          this.isLoading = false;
          onError(err.message);
        });
    }

    this.isLoading = false;

    return null;
  };

  handleOnClick = (event: any) => {
    event.preventDefault();
    event.stopPropagation();
    const { confirmOnClick, disabled } = this.props;
    const isLoading = this.isLoading || this.props.isLoading;

    if (disabled || isLoading) {
      return null;
    }

    if (confirmOnClick && confirmOnClick.text && !this.isConfirmTooltipOpen) {
      return (this.isConfirmTooltipOpen = true);
    }

    return !this.isConfirmTooltipOpen && this.onClick();
  };

  getPosition() {
    return { top: 60, right: 0 };
  }

  renderConfirmTooltip = () => {
    const { confirmOnClick, theme } = this.props;

    if (!confirmOnClick || !this.isConfirmTooltipOpen) {
      return null;
    }

    const { text, okBtnText, cancelBtnText } = confirmOnClick;
    const position = this.getPosition();

    return (
      <TooltipWrap position={position} theme={theme}>
        <div>{text}</div>
        <Row jc="space-between" flex="1 0 auto" style={{ width: '100%' }} margin="16px 0 0">
          <StyledButton
            transparent
            pad="8px"
            onClick={() => {
              this.isConfirmTooltipOpen = false;
            }}
          >
            {cancelBtnText}
          </StyledButton>
          <StyledButton
            pad="8px"
            onClick={() => {
              this.isConfirmTooltipOpen = false;
              this.onClick();
            }}
          >
            {okBtnText}
          </StyledButton>
        </Row>
      </TooltipWrap>
    );
  };

  render() {
    const { btnType = 'default', children, isLoading, className, ...rest } = this.props;
    const isButtonLoading = this.isLoading || isLoading;

    return (
      <div style={{ position: 'relative' }} className={className}>
        <StyledButton {...rest} onClick={this.handleOnClick}>
          <Content>
            {children}
            {isButtonLoading && <StyledLoader color="white" size="small" />}
          </Content>
        </StyledButton>
        {this.renderConfirmTooltip()}
      </div>
    );
  }
}

export const Button: React.ComponentType<IButtonProps> = withTheme(ButtonClass);
Button.displayName = 'Button';

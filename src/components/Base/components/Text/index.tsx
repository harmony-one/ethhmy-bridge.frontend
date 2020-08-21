import * as React from 'react';
import styled from 'styled-components';

import { get } from 'lodash';
import { TEdgeSize, getMarginCSS, getPaddingCSS } from '../../utils';

type TTextSize = 'xxsmall' | 'xsmall' | 'small' | 'medium' | 'large' | 'xlarge';

const sizes = {
  xxsmall: '12px',
  xsmall: '13px',
  small: '14px',
  medium: '15px',
  large: '18px',
  xlarge: '22px',
};

function getFontSize(size: TTextSize, theme: any) {
  const defaultSize = get(theme, 'sizes.defaults.text', 'medium');
  const themeSize = get(theme, `sizes.text.${size || defaultSize}`, '');

  return themeSize || sizes[size || defaultSize];
}

function getFont(font: string, theme: any) {
  const defaultFont = get(theme, 'fontBase', 'Roboto-Medium');

  return font || get(theme, 'fonts.text', defaultFont);
}

interface ITitleProps {
  size?: TTextSize;
  text?: string;
  color?: string;
  bold?: boolean;
  fontFamily?: string;
  style?: React.CSSProperties;
  pad?: TEdgeSize;
  margin?: TEdgeSize;
  className?: string;
}

const TextWrap = styled.div<ITitleProps>`
  font-family: ${props => getFont(props.fontFamily, props.theme)}};
  font-size: ${props => getFontSize(props.size, props.theme)};
  font-weight: ${props => (props.bold ? '700' : '500')};
  color: ${props =>
    props.theme.palette[props.color] || props.color || props.theme.textColor || 'black'};

  ${props => props.pad && getPaddingCSS(props.pad, props.theme)}
  ${props => props.margin && getMarginCSS(props.margin, props.theme)}
  
  letter-spacing: 0.5px;
`;

export class Text extends React.Component<ITitleProps> {
  render() {
    const { text, children } = this.props;

    return <TextWrap {...this.props}>{children || text}</TextWrap>;
  }
}

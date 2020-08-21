import * as React from 'react';
import styled from 'styled-components';

import { get } from 'lodash';
import { TEdgeSize, getMarginCSS, getPaddingCSS } from '../../utils';

type TTitleSize = 'xxsmall' | 'xsmall' | 'small' | 'medium' | 'large' | 'xlarge';

const sizes = {
  xxsmall: '16px',
  xsmall: '18px',
  small: '21px',
  medium: '24px',
  large: '30px',
  xlarge: '36px',
};

function getFont(font: string, theme: any) {
  const defaultFont = get(theme, 'fontBase', 'Roboto-Medium');

  return font || get(theme, 'fonts.title', defaultFont);
}

function getFontSize(size: TTitleSize, theme: any) {
  const defaultSize = get(theme, 'sizes.defaults.title', 'medium');
  const themeSize = get(theme, `sizes.title.${size || defaultSize}`, null);

  return themeSize || sizes[size || defaultSize];
}

interface ITitleProps {
  size?: TTitleSize;
  color?: string;
  text?: string;
  bold?: boolean;
  fontFamily?: string;
  style?: React.CSSProperties;
  pad?: TEdgeSize;
  margin?: TEdgeSize;
}

const TitleWrap = styled.div<ITitleProps>`
  font-family: ${props => getFont(props.fontFamily, props.theme)}};
  font-size: ${props => getFontSize(props.size, props.theme)};
  font-weight: ${props => (props.bold ? '700' : '500')};
  text-align: left;
  color: ${props =>
    props.theme.palette[props.color] || props.color || props.theme.titleColor || 'black'};

  ${props => props.pad && getPaddingCSS(props.pad, props.theme)}
  ${props => props.margin && getMarginCSS(props.margin, props.theme)}
`;

export class Title extends React.Component<ITitleProps> {
  render() {
    const { text, children } = this.props;

    return <TitleWrap {...this.props}>{children || text}</TitleWrap>;
  }
}

import * as React from 'react';
import styled from 'styled-components';

import { get } from 'lodash';
import { TEdgeSize, getMarginCSS, getPaddingCSS } from '../../utils';

type TTextSize =
  | 'xxxsmall'
  | 'xxsmall'
  | 'xsmall'
  | 'small'
  | 'medium'
  | 'large'
  | 'xlarge';

const sizes = {
  xxxsmall: '10px',
  xxsmall: '12px',
  xsmall: '14px',
  small: '14px',
  medium: '16px',
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
  align?: 'center';
  fontFamily?: string;
  lh?: string;
  style?: React.CSSProperties;
  pad?: TEdgeSize;
  margin?: TEdgeSize;
  className?: string;
  uppercase?: boolean;
}

const TextWrap = styled.div<ITitleProps>`
  font-family: ${props => getFont(props.fontFamily, props.theme)}};
  font-size: ${props => getFontSize(props.size, props.theme)};
  font-weight: ${props => (props.bold ? '700' : '500')};
  color: ${props =>
    props.theme.palette[props.color] ||
    props.color ||
    props.theme.textColor ||
    'black'};

  text-align: ${props => props.align || ''};

  ${props => props.pad && getPaddingCSS(props.pad, props.theme)}
  ${props => props.margin && getMarginCSS(props.margin, props.theme)}
  
  text-transform: ${props => (props.uppercase ? 'uppercase' : '')};
  line-height: ${props => props.lh || ''}
`;

export class Text extends React.Component<ITitleProps> {
  render() {
    const { text, children } = this.props;

    return <TextWrap {...this.props}>{children || text}</TextWrap>;
  }
}

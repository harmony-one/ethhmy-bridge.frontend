import * as React from 'react';
import { get } from 'lodash';

export const sizes = {
  small: '100px',
  medium: '162px',
  large: '200px',
  xlarge: '308px',
  xxlarge: '384px',
  full: '100%',
  auto: 'auto',
};

export type TSize = 'small' | 'medium' | 'large' | 'xlarge' | 'xxlarge' | 'full' | 'auto';

export function getSize(size: TSize, theme: any, _defaultSize: TSize = 'medium') {
  const defaultSize = get(theme, 'sizes.defaults.linear', _defaultSize || 'medium');
  const themeSize = get(theme, `sizes.linear.${size || defaultSize}`, '');

  return themeSize || sizes[size || defaultSize];
  return sizes[size || defaultSize];
}

export function getColor(color: string, palette: Record<string, string>) {
  return palette[color] || color;
}

export interface ICommonInputProps {
  size?: TSize;
  value?: any;
  onChange?(data: any): any;
  name?: string;
  disabled?: boolean;
  margin?: string;
  style?: React.CSSProperties;
  renderLeft?: React.ReactNode;
  renderRight?: React.ReactNode;
}

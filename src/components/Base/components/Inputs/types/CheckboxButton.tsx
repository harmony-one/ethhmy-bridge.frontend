import * as React from 'react';
import styled, { withTheme } from 'styled-components';
import { Icon } from '../../Icons';
import { ICommonInputProps, getSize } from '../common';

const HiddenInput = styled.input<any>`
  display: none;
  width: 0;
  height: 0;
`;

const Label = styled.label<any>`
  color: ${props =>
    props.checked ? props.theme.palette.NBlack : props.theme.palette.NWhite};
  background-color: ${props =>
    props.checked ? props.theme.palette.NWhite : props.theme.palette.NBlack};
  border: 1px solid white;
  border-radius: 15px;
  margin: ${props => (props.margin ? props.margin : '')};
  font-size: 12px;
  box-sizing: border-box;
  display: flex;
  flex-direction: ${props => props.direction || 'row'};
  align-items: center;
  padding: 0 30px;
  cursor: pointer;
  user-select: none;
  width: ${props => getSize(props.size, props.theme, 'xlarge')};
  line-height: 1.1;
  height: 44px;

  font-family: ${props => props.theme.fontBase || 'Roboto-Medium", sans-serif'};

  * {
    font-family: ${props =>
      props.theme.fontBase || 'Roboto-Medium", sans-serif'};
  }
`;

export interface ICheckboxProps extends ICommonInputProps {
  label: string;
  value?: boolean;
  name?: string;
  onChange?(value: boolean): any;
  theme?: any;
  style?: React.CSSProperties;
  disabled?: boolean;
}

const Checkbox = (props: ICheckboxProps) => {
  const { theme, label, value, name, onChange, style, size, disabled } = props;

  return (
    <Label style={style} checked={value} theme={theme} size={size}>
      <HiddenInput
        type="checkbox"
        name={name}
        value={value}
        checked={value}
        onChange={(event: any) => !disabled && onChange(event.target.checked)}
      />
      <div style={{ opacity: disabled ? 0.5 : 1, marginTop: 4 }}>{label}</div>
    </Label>
  );
};

export const CheckboxButton: React.ComponentType<ICheckboxProps> = withTheme(
  Checkbox,
);

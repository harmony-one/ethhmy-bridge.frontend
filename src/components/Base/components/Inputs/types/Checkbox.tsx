import * as React from 'react';
import styled, { withTheme } from 'styled-components';
import { Icon } from '../../Icons';
import { ICommonInputProps, getSize } from '../common';

const HiddenInput = styled.input<any>`
  visibility: hidden;
  width: 0;
  height: 0;
`;

const Label = styled.label<any>`
  color: ${props => props.theme.styled.input.textColor};
  border: none;
  border-radius: 4px;
  margin: ${props => (props.margin ? props.margin : '')};
  font-size: 16px;
  box-sizing: border-box;
  display: flex;
  flex-direction: ${props => props.direction || 'row'};
  align-items: center;
  padding: 8px 8px 8px 0;
  cursor: pointer;
  user-select: none;
  width: ${props => getSize(props.size, props.theme, 'xlarge')};
  line-height: 1.1;

  font-family: ${props => props.theme.fontBase || 'Roboto-Medium", sans-serif'};

  * {
    font-family: ${props => props.theme.fontBase || 'Roboto-Medium", sans-serif'};
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

const CheckboxClass = (props: ICheckboxProps) => {
  const { theme, label, value, name, onChange, style, size, disabled } = props;
  const { colorPrimary } = theme.styled.colors;
  const { disabledColor } = theme.styled.input;

  return (
    <Label style={style} theme={theme} size={size}>
      <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', marginRight: 5 }}>
        {value ? (
          <Icon
            glyph="CheckBox"
            onClick={() => onChange(false)}
            color={disabled ? disabledColor : colorPrimary}
          />
        ) : (
          <Icon
            glyph="CheckBoxEmpty"
            onClick={() => onChange(true)}
            color={disabled ? disabledColor : colorPrimary}
          />
        )}
      </div>
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

export const Checkbox: React.ComponentType<ICheckboxProps> = withTheme(CheckboxClass);

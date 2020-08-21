import * as React from 'react';
import styled, { withTheme } from 'styled-components';
import { Icon } from '../../Icons';
import { ICommonInputProps, TSize, getSize } from '../common';

const StyledRadioWrap = styled.div<any>`
  color: ${props => props.theme.styled.input.textColor};
  border: none;
  border-radius: 4px;
  margin: ${props => (props.margin ? props.margin : '')};
  font-size: 15px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;

  * {
    font-family: ${props => props.theme.fontBase || 'Roboto-Medium", sans-serif'};
  }
`;

const HiddenInput = styled.input<any>`
  visibility: hidden;
  width: 8px;
  height: 0;
  flex: 0 0 auto;
`;

const Label = styled.label<any>`
  display: flex;
  flex: 0 0 auto;
  flex-direction: row;
  align-items: center;
  padding: 4px 4px 4px 0;
  cursor: pointer;
  user-select: none;
  font-size: 13px;
  margin-right: 32px;
  width: ${props => getSize(props.size, props.theme)};
`;

interface IRadioOptionProps {
  text: string | React.FunctionComponent | React.ReactNode;
  value: string | number;
  name?: string;
  checkedValue?: string;
  onChange?(value: any): any;
  styles?: object;
  theme?: any;
  disabled?: boolean;
  size?: TSize;
}

export interface IRadioGroupProps {
  value?: string | number;
  options?: IRadioOptionProps[];
  direction?: 'row' | 'row-wrap' | 'column';
  onChange?(value: any): any;
  label?: string;
  name?: string;
  optionsStyles?: object;
  optionSize?: TSize;
}

const RadioButton = (props: IRadioOptionProps) => {
  const {
    theme,
    text,
    value,
    checkedValue,
    onChange,
    styles,
    name = 'radio',
    disabled,
    size = 'auto',
  } = props;
  const checked = value === checkedValue;

  const { colorPrimary } = theme.styled.colors;
  const { disabledColor } = theme.styled.input;

  return (
    <Label style={styles} size={size}>
      <div style={{ flex: '0 0 auto' }}>
        {checked ? (
          <Icon glyph="RadioButton" nativeClick color={disabled ? disabledColor : colorPrimary} />
        ) : (
          <Icon
            glyph="RadioButtonEmpty"
            nativeClick
            color={disabled ? disabledColor : colorPrimary}
            checked
          />
        )}
      </div>

      <HiddenInput
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={(event: any) => {
          !disabled && onChange(event.target.value);
        }}
      />
      <div style={{ opacity: disabled ? 0.5 : 1 }}>{text}</div>
    </Label>
  );
};

const RadioGroupClass = (props: ICommonInputProps & IRadioGroupProps & { theme: object }) => {
  const {
    options = [],
    theme,
    label,
    direction = 'column',
    value,
    name,
    onChange,
    optionSize,
    optionsStyles,
  } = props;

  return (
    <StyledRadioWrap theme={theme}>
      {label && (
        <p>
          <b>{label}</b>
        </p>
      )}
      <div style={{ display: 'flex', flexDirection: direction as any, flexWrap: 'wrap' }}>
        {options.map(option => (
          <RadioButton
            key={option.value}
            {...option}
            name={name}
            size={optionSize}
            checkedValue={value}
            onChange={onChange}
            styles={optionsStyles}
            theme={theme}
          />
        ))}
      </div>
    </StyledRadioWrap>
  );
};

export const RadioGroup: React.ComponentType<ICommonInputProps & IRadioGroupProps> = withTheme(
  RadioGroupClass
);

import React, { CSSProperties } from 'react';
import ReactSelect, { StylesConfig, components } from 'react-select';
import { ThemeConfig } from 'react-select/src/theme';
import { withTheme } from 'styled-components';

import { Icon } from '../../../Icons';
import { ICommonInputProps } from '../../common';
import { SelectType, getStyles } from './getStyles';

export interface ISelectOption {
  text: string | number;
  value: string | number;
}

const DropdownIndicator = (props: any) => {
  const { selectProps } = props;
  const { type, theme } = selectProps;
  const { ddIndicatorProps = {} } = theme.styled.input;
  const { pad, color = 'red', size } = ddIndicatorProps;

  return (
    <components.DropdownIndicator {...props}>
      <Icon
        glyph={props.glyph || 'ArrowDown'}
        size={type === 'filter' ? '13px' : size || '16px'}
        fill={color}
        pad={pad}
      />
    </components.DropdownIndicator>
  );
};

function mapOptions(options: ISelectOption[]) {
  return options.map(({ text, value }) => ({ label: text, value }));
}

interface IReactSelectOption {
  value: string | number;
  label: string | number;
}

function selectValueByOption(option: IReactSelectOption) {
  return option.value;
}

function selectOptionByValue(
  value: string,
  options: IReactSelectOption[],
  noDefaultValue: boolean
) {
  if (noDefaultValue) {
    return undefined;
  }

  return options.find(i => i.value === value) || ({} as IReactSelectOption);
}

export interface ISelectProps extends ICommonInputProps {
  value?: any;
  theme?: ThemeConfig;
  options: ISelectOption[];
  type?: SelectType;
  styles?: StylesConfig | Partial<Record<keyof StylesConfig, CSSProperties>>;
  glyph?: string;
  disabled?: boolean;
  placeholder?: string;
  noDefaultValue?: boolean;
}

const SelectClass = (props: ICommonInputProps & ISelectProps) => {
  const { type = 'default', styles, disabled, placeholder, noDefaultValue } = props;

  const mappedOptions = mapOptions(props.options);

  return (
    <ReactSelect
      isSearchable={false}
      theme={props.theme}
      size={props.size}
      isDisabled={disabled}
      styles={getStyles(type, styles)}
      menuPlacement="auto"
      components={{
        DropdownIndicator: ddProps => <DropdownIndicator glyph={props.glyph} {...ddProps} />,
      }}
      options={mappedOptions}
      defaultValue={selectOptionByValue(props.value, mappedOptions, noDefaultValue)}
      onChange={(option: IReactSelectOption) => props.onChange(selectValueByOption(option))}
      {...injectValueProp(props.value, props.options)}
      placeholder={placeholder}
    />
  );
};

export const Select: React.ComponentType<ISelectProps> = withTheme(SelectClass);

const injectValueProp = (value: any, options: ISelectOption[]) =>
  typeof value === 'undefined'
    ? {}
    : { value: mapOptions(options).find(option => option.value === value) };

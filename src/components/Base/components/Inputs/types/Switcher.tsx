import React, { Component } from 'react';
import Switch from 'react-switch';
import styled, { withTheme } from 'styled-components';
import { ICommonInputProps } from '../common';

interface ISwitcherProps {
  onChange?(value?: boolean): any;
  value: boolean;
  label: string | React.ReactNode;
}

const Label = styled.label`
  display: flex;
  align-items: center;
  font-family: ${props => props.theme.fontBase || 'Roboto-Medium", sans-serif'};
`;

const Span = styled.span`
  margin-left: 10px;
  flex: 1 1 auto;
  word-wrap: break-word;
  font-size: 14px;
  user-select: none;
`;

class SwitcherClass extends Component<ISwitcherProps & { theme: any }> {
  render() {
    const { onChange, value, label, theme } = this.props;

    return (
      <Label>
        <Switch
          onChange={onChange}
          checked={value}
          checkedIcon={false}
          uncheckedIcon={false}
          onColor={theme.styled.colors.colorPrimary}
          offColor="#D2D6E1"
          activeBoxShadow="none"
          height={18}
          width={30}
          handleDiameter={12}
        />
        <Span>{label}</Span>
      </Label>
    );
  }
}

export const Switcher: React.ComponentType<ICommonInputProps & ISwitcherProps> = withTheme(
  SwitcherClass
);

import * as React from 'react';
import styled, { withTheme } from 'styled-components';
import { ICommonInputProps, getSize } from '../common';

const inputMasks = {
  currency: '^[0-9]+(\\.[0-9]{0,2})?$',
  integer: '^[0-9]+$',
};

const Area = styled.textarea<any>`
  display: flex;
  background-color: ${props => props.theme.styled.input.bgColor};
  color: ${props => props.theme.styled.input.textColor};
  border: none;
  border-bottom: ${props => props.theme.styled.input.border};
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
  padding: 12px;
  margin: ${props => (props.margin ? props.margin : '')};
  font-size: 14px;
  box-sizing: border-box;
  min-width: ${props => getSize(props.size, props.theme)};
  min-height: 48px;

  opacity: ${props => (props.disabled ? 0.5 : 1)};

  &:focus {
    outline: none;
  }

  > * {
    font-family: ${props => props.theme.fontBase};
  }
`;

export interface ITextAreaProps extends ICommonInputProps {
  value?: string;
  mask?: string;
  type?: string;
  renderLeft?: React.ReactNode;
  renderRight?: React.ReactNode;
  style?: React.CSSProperties;
}

class TextAreaClass extends React.Component<ICommonInputProps & ITextAreaProps> {
  onChange = event => {
    const { value } = event.target;
    const { mask, onChange } = this.props;

    if (!value) {
      return onChange(value);
    }

    if (!inputMasks[mask]) {
      return onChange(value);
    }

    if (new RegExp(inputMasks[mask], 'gm').test(value.toString())) {
      return onChange(value);
    }
  };

  render() {
    const { renderLeft, renderRight, children, onChange, style, ...rest } = this.props;

    return <Area {...rest} style={style} onChange={this.onChange} />;
  }
}

export const TextArea: React.ComponentType<ITextAreaProps> = withTheme(
  // @ts-ignore
  TextAreaClass
);

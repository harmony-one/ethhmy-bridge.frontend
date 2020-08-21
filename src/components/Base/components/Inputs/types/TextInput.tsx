import { get } from 'lodash';
import * as React from 'react';
import styled, { withTheme } from 'styled-components';
import { Row } from '../../Layout';
import { ICommonInputProps, TSize, getColor, getSize } from '../common';

const Input = styled.input`
  background-color: transparent;
  color: ${props => props.theme.styled.input.textColor};
  border: none;
  padding: 0;
  font-size: 14px;
  box-sizing: border-box;
  width: 100%;

  &:focus {
    outline: none;
  }
`;

type TPlacement = 'Top' | 'Right' | 'Bottom' | 'Left';
type TBRadiusPlacement = 'TopLeft' | 'TopRight' | 'BottomLeft' | 'BottomRight';

export function getInputBorder(props: IInputWrapProps & { theme: any }, placement: TPlacement) {
  const { theme } = props;
  const { input } = theme.styled;

  return (
    props[`border${placement}`] ||
    input[`border${placement}`] ||
    props.border ||
    input.border ||
    'none'
  );
}

export function getInputBorderRadius(
  props: IInputWrapProps & { theme: any },
  placement: TBRadiusPlacement
) {
  const { theme } = props;
  const { input = {} } = get(theme, 'styled', {});

  return (
    props[`border${placement}Radius`] ||
    input[`border${placement}Radius`] ||
    props.borderRadius ||
    input.borderRadius ||
    '0'
  );
}

interface IInputWrapProps {
  bgColor: string;

  border: string;
  borderTop: string;
  borderRight: string;
  borderBottom: string;
  borderLeft: string;

  borderRadius: string;
  borderTopLeftRadius: string;
  borderTopRightRadius: string;
  borderBottomLeftRadius: string;
  borderBottomRightRadius: string;

  margin: string;
  size: TSize;
  disabled: boolean;
}

const InputWrap = styled.div<IInputWrapProps>`
  display: flex;
  background-color: ${props =>
    getColor(props.bgColor || props.theme.styled.input.bgColor, props.theme.palette)};
  color: ${props => getColor(props.theme.styled.input.textColor, props.theme.palette)};
  border-top: ${props => getInputBorder(props, 'Top')};
  border-right: ${props => getInputBorder(props, 'Right')};
  border-bottom: ${props => getInputBorder(props, 'Bottom')};
  border-left: ${props => getInputBorder(props, 'Left')};
  border-top-left-radius: ${props => getInputBorderRadius(props, 'TopLeft')};
  border-top-right-radius: ${props => getInputBorderRadius(props, 'TopRight')};
  border-bottom-left-radius: ${props => getInputBorderRadius(props, 'BottomLeft')};
  border-bottom-right-radius: ${props => getInputBorderRadius(props, 'BottomRight')};
  padding: 14px;
  margin: ${props => (props.margin ? props.margin : '')};
  font-size: 16px;
  box-sizing: border-box;
  width: ${props => getSize(props.size, props.theme)};

  opacity: ${props => (props.disabled ? 0.5 : 1)};

  &:focus {
    outline: none;
  }

  > * {
    font-family: ${props => props.theme.fontBase};
  }
`;

export interface ITextInputProps extends ICommonInputProps {
  value?: string | number;
  mask?: string;
  type?: string;
  style?: React.CSSProperties;
  placeholder?: string;
  onChange?(value: any, event?: React.ChangeEvent<HTMLInputElement>): void;
}

export const TextInputComponent = React.forwardRef<
  HTMLInputElement,
  ITextInputProps & Partial<IInputWrapProps> & { theme?: {} }
>((props, ref) => {
  const { renderLeft, renderRight, children, onChange, style, mask, ...rest } = props;
  const { wrapperProps, inputProps } = divideProps(rest);

  const onChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    const targetValue = event.target.value;

    if (!targetValue) {
      return onChange(targetValue, event);
    }

    if (!mask) {
      return onChange(targetValue, event);
    }

    if (new RegExp(mask, 'gm').test(targetValue.toString())) {
      return onChange(targetValue, event);
    }
  };

  return (
    <InputWrap {...wrapperProps} style={style}>
      {renderLeft && (
        <Row flex="0 0 auto" margin="0 8px 0 0">
          {renderLeft}
        </Row>
      )}
      <Row flex="1 1 100%">
        <Input {...inputProps} onChange={onChangeHandler} ref={ref} />
      </Row>
      {renderRight && (
        <Row flex="0 0 auto" margin="0 0 0 8px">
          {renderRight}
        </Row>
      )}
    </InputWrap>
  );
});

export const TextInput = withTheme(TextInputComponent);
TextInput.displayName = 'TextInput';

const divideProps = (props: ITextInputProps & Partial<IInputWrapProps> & { theme?: {} }) => {
  const {
    mask,
    size,
    bgColor,
    border,
    borderTop,
    borderRight,
    borderBottom,
    borderLeft,
    borderRadius,
    borderTopLeftRadius,
    borderTopRightRadius,
    borderBottomRightRadius,
    borderBottomLeftRadius,
    margin,
    ...inputProps
  } = props;

  const wrapperProps = {
    size,
    bgColor,
    border,
    borderTop,
    borderRight,
    borderBottom,
    borderLeft,
    borderRadius,
    borderTopLeftRadius,
    borderTopRightRadius,
    borderBottomRightRadius,
    borderBottomLeftRadius,
    margin,
    disabled: props.disabled,
    theme: props.theme,
  };

  return { inputProps, wrapperProps };
};

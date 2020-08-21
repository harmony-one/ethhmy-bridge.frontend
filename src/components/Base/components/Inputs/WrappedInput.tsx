import * as React from 'react';
import {
  Checkbox,
  ICheckboxProps,
  INumberInputProps,
  IRadioGroupProps,
  ISelectProps,
  ITextAreaProps,
  ITextInputProps,
  NumberInput,
  RadioGroup,
  Select,
  TextArea,
  TextInput,
} from './types';
import { FieldWrapper, IFieldWrapperProps } from './FieldWrapper';

type WrapperedInputProps<T> = T & IPartialWrapperProps;

const withWrapper = <T extends {}>(Component) => (props: WrapperedInputProps<T>) => {
  const { title, label, className, help, visible = true, isRowLabel, margin, ...rest } = props;
  const wrapperProps = {
    title,
    label,
    className,
    help,
    visible,
    isRowLabel,
    margin,
  };

  return (
    <FieldWrapper {...wrapperProps}>
      <Component {...rest} />
    </FieldWrapper>
  );
};

export const WrappedInput = withWrapper(TextInput) as IWrappedInput;
WrappedInput.TextArea = withWrapper(TextArea);
WrappedInput.Number = withWrapper(NumberInput);
WrappedInput.Select = withWrapper(Select);
WrappedInput.RadioGroup = withWrapper(RadioGroup);
WrappedInput.Checkbox = Checkbox;

interface IWrappedInput extends WrapperHOC<ITextInputProps> {
  TextArea: WrapperHOC<ITextAreaProps>;
  Number: WrapperHOC<INumberInputProps>;
  Select: WrapperHOC<ISelectProps>;
  RadioGroup: WrapperHOC<IRadioGroupProps>;
  Checkbox: React.ComponentType<ICheckboxProps>;
}

type WrapperHOC<T> = (props: WrapperedInputProps<T>) => JSX.Element;
type IPartialWrapperProps = Partial<Omit<IFieldWrapperProps, 'children'>>;

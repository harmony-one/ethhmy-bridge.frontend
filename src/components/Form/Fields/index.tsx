import {
  TextInput,
  NumberInput as Number,
  TextArea as TextAreaInput,
  Select as SelectInput,
  FieldWrapper,
  RadioGroup as RadioGroupInput,
  Checkbox as CheckBoxInput,
  FileInput as File,
  // } from 'packages/Components/src';
} from 'components/Base';

import * as React from 'react';
import { createField } from '../';

export const Input = createField<any>({
  wrapper: FieldWrapper,
  wrapperParams: { hasFeedback: true },
  component: props => <TextInput size="full" {...props} />,
});

export const FileInput = createField<any>({
  wrapper: FieldWrapper,
  wrapperParams: { hasFeedback: true },
  component: props => <File size="full" {...props} />,
});

export const NumberInput = createField<any>({
  wrapper: FieldWrapper,
  wrapperParams: { hasFeedback: true },
  component: props => <Number size="full" {...props} />,
});

export const TextArea = createField<any>({
  wrapper: FieldWrapper,
  wrapperParams: { hasFeedback: true },
  component: props => <TextAreaInput size="full" {...props} />,
});

export const Select = createField<any>({
  wrapper: FieldWrapper,
  wrapperParams: { hasFeedback: true },
  component: props => <SelectInput size="full" {...props} />,
});

export const RadioGroup = createField<any>({
  wrapper: FieldWrapper,
  wrapperParams: { hasFeedback: true },
  component: props => <RadioGroupInput size="full" {...props} />,
});

export const Checkbox = createField<any>({
  wrapper: FieldWrapper,
  wrapperParams: { hasFeedback: true, margin: '0' },
  component: props => <CheckBoxInput size="full" {...props} />,
});

export const Password = createField<any>({
  wrapper: FieldWrapper,
  wrapperParams: { hasFeedback: true },
  component: props => <TextInput type="password" size="full" {...props} />,
});

export type TOptions = any;

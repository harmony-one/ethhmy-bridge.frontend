import React, { useEffect } from 'react';
import { limitLength, limitNumber, normalizeNumber, pipe } from '../../helpers';
import { ITextInputProps, TextInput } from '../TextInput';

type TValueTypes = 'integer' | 'decimal' | 'currency';

type TValueFn = (value: string | number) => string | number;

const types: Record<
  TValueTypes,
  {
    mask(props: INumberInputProps): string;
    getValue(props: INumberInputProps): TValueFn;
    onChange(props: INumberInputProps): TValueFn;
  }
> = {
  integer: {
    mask: props => (props.min >= 0 ? `^[0-9]+$` : `(^[-]{1}$|[-]?[0-9]+$)`),
    getValue: props =>
      pipe(value => limitNumber(value, props.min, props.max), limitLength, normalizeNumber),
    onChange: props =>
      pipe(normalizeNumber, limitLength, value => limitNumber(value, props.min, props.max)),
  },
  decimal: {
    mask: props =>
      props.min >= 0
        ? `^[0-9]+(\\${props.delimiter || ','}[0-9]{0,${props.precision || 2}})?$`
        : `(^[-]{1}$|^[-]?[0-9]+(\\${props.delimiter || ','}[0-9]{0,${props.precision || 2}})?$)`,
    getValue: props =>
      pipe(
        value => limitNumber(value, props.min, props.max),
        limitLength,
        normalizeNumber,
        value => String(value).replace('.', props.delimiter || ',')
      ),
    onChange: props =>
      pipe(
        value => String(value).replace(props.delimiter || ',', '.'),
        normalizeNumber,
        limitLength,
        value => limitNumber(value, props.min, props.max)
      ),
  },
  currency: {
    mask: props => `^[0-9]+(\\${props.delimiter || ','}[0-9]{0,${props.precision || 2}})?$`,
    getValue: props =>
      pipe(
        value => limitNumber(value, 0, props.max),
        limitLength,
        normalizeNumber,
        value => String(value).replace('.', props.delimiter || ',')
      ),
    onChange: props =>
      pipe(
        value => String(value).replace(props.delimiter || ',', '.'),
        normalizeNumber,
        limitLength,
        value => limitNumber(value, 0, props.max)
      ),
  },
};

export interface INumberInputProps extends ITextInputProps {
  type?: TValueTypes;
  max?: number;
  min?: number;
  precision?: number;
  delimiter?: string;
}

export const NumberInput: React.FC<INumberInputProps> = ({ type = 'integer', ...props } = {}) => {
  const { mask, getValue, onChange: onChangeNormalize } = types[type];

  const onChangeHandler = valueArg => onChangeNormalize(props)(valueArg);

  useEffect(() => {
    props.onChange(onChangeHandler(props.value));
  }, []);

  return (
    <TextInput
      {...props}
      mask={mask(props)}
      value={getValue(props)(props.value)}
      onChange={valueArg => props.onChange(onChangeHandler(valueArg))}
    />
  );
};

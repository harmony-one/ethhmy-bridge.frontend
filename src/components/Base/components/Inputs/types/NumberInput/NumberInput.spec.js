/* eslint-disable no-use-before-define */
import * as React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { NumberInput } from '.';

const InputTestPreset = ({ defaultValue = 0, ...props } = {}) => {
  const [value, setValue] = React.useState(defaultValue);
  const mockTheme = { styled: { input: {} }, palette: {} };

  return (
    <ThemeProvider theme={mockTheme}>
      <NumberInput value={value} onChange={setValue} {...props} />
    </ThemeProvider>
  );
};

let utils = null;

const setup = (props = {}) => {
  const placeholder = '1000';

  utils = render(<InputTestPreset {...props} placeholder={placeholder} />);
  utils.input = utils.getByPlaceholderText(placeholder);

  return utils;
};

// clean up - tests should not affect each other
afterEach(() => {
  utils.unmount();
  utils = null;
});

describe('Number Input', () => {
  describe('Checking numbers', () => {
    const props = {
      defaultValue: '1000',
      type: 'integer',
    };

    beforeEach(() => {
      setup(props);
    });

    test('Should change value when passed digit', () => {
      const newValue = '2000';
      const { input } = utils;

      fireEvent.change(input, { target: { value: newValue } });

      expect(input.value).toBe(newValue);
    });

    test('Should accept only digits', () => {
      const { input } = utils;

      fireEvent.change(input, { target: { value: '' } });

      const userString = 'hello';
      const userNumber = '2000';

      appendToInputByOneSymbol(userString + userNumber);

      expect(input.value).toBe(userNumber);
    });
  });

  describe('Minimum and maximum', () => {
    test('Should not accept values below minimum', () => {
      const props = {
        defaultValue: '0',
        type: 'integer',
        min: 0,
      };
      const forbiddenUserValues = stringArray((_, index) => props.min - 1 - index);
      const { input } = setup(props);

      forbiddenUserValues.forEach(value => fireEvent.change(input, { target: { value } }));

      expect(input.value).toBe(props.defaultValue);
    });

    test('Should accept values above minimun', () => {
      const props = {
        type: 'integer',
        min: 0,
      };
      const acceptedUserValues = stringArray((_, index) => props.min + 1 + index);
      const { input } = setup(props);

      acceptedUserValues.forEach(value => fireEvent.change(input, { target: { value } }));

      expect(input.value).toBe(last(acceptedUserValues));
    });

    test('Should not accept values above maximum', () => {
      const props = {
        defaultValue: '0',
        type: 'integer',
        max: 0,
      };

      const forbiddenUserValues = stringArray((_, index) => props.max + 1 + index);
      const { input } = setup(props);

      forbiddenUserValues.forEach(value => fireEvent.change(input, { target: { value } }));
      expect(input.value).toBe(props.defaultValue);
    });

    test('Should accept values below maximum', () => {
      const props = {
        defaultValue: '0',
        type: 'integer',
        max: 0,
      };

      const acceptedUserValues = stringArray((_, index) => props.max - 1 - index);
      const { input } = setup(props);

      acceptedUserValues.forEach(value => fireEvent.change(input, { target: { value } }));
      expect(input.value).toBe(last(acceptedUserValues));
    });
  });

  describe('Precision', () => {
    test('Should accept decimal number with 2 decimal places by default', () => {
      const props = {
        type: 'decimal',
        delimiter: ',',
      };

      const userValue = `1000${props.delimiter}52`;
      const { input } = setup(props);

      fireEvent.change(input, { target: { value: userValue } });

      expect(input.value).toBe(userValue);
    });

    test('Precision prop should not affect the input if type is integer', () => {
      const props = {
        type: 'integer',
        precision: 2,
        delimiter: ',',
      };

      const incorrectInteger = `1000${props.delimiter}52`;
      const expectedUserValue = incorrectInteger.replace(props.delimiter, '');
      const { input } = setup(props);

      appendToInputByOneSymbol(incorrectInteger);

      expect(input.value).toBe(expectedUserValue);
    });

    test('Should not change input, if amount of characters after delimiter is greater or equal to precision prop', () => {
      const props = {
        type: 'decimal',
        precision: 2,
        delimiter: ',',
      };

      const defaultValue = `1000${props.delimiter}00`;
      const userValue = '0000';
      const { input } = setup(props);

      fireEvent.change(input, { target: { value: defaultValue } });

      appendToInputByOneSymbol(userValue);

      expect(input.value).toBe(defaultValue);
    });
  });

  describe('Delimiter', () => {
    test('Comma should be accepted by default', () => {
      const props = {
        type: 'decimal',
        precision: 2,
      };

      const userValue = '1000,00';
      const { input } = setup(props);

      fireEvent.change(input, { target: { value: userValue } });

      expect(input.value).toBe(userValue);
    });

    test('Should accept only given delimeter', () => {
      const props = {
        type: 'decimal',
        delimiter: '.',
      };

      const userValue = '1000.,><!00';
      const { input } = setup(props);

      appendToInputByOneSymbol(userValue);

      expect(input.value).toBe('1000.00');
    });

    test('Should accept delimeter only once', () => {
      const props = {
        type: 'decimal',
        delimeter: ',',
      };

      const userValue = '1000,,,,0,0,,,';
      const { input } = setup(props);

      appendToInputByOneSymbol(userValue);

      expect(input.value).toBe('1000,00');
    });
  });
});

// utils
const appendToInputByOneSymbol = value => {
  const { input } = utils;

  [...value].forEach(char => {
    fireEvent.change(input, { target: { value: input.value + char } });
  });
};

const stringArray = (fn, number = 100) =>
  Array.from({ length: number }, fn).map(it => it.toString());

const last = arr => arr.slice(-1)[0];

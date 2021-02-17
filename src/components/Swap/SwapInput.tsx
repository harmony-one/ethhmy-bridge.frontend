import { Input } from 'semantic-ui-react';
import React from 'react';

export const SwapInput = (props: { value: string; setValue: any; placeholder?: string; width?: string }) => {
  return (
    <Input
      style={{
        padding: 0,
        width: props.width || '180px',
      }}
      transparent
      size="massive"
      placeholder={props.placeholder || '0.0'}
      value={props.value}
      onChange={(_, { value }: { value: string }) => {
        props.setValue(value);
      }}
    />
  );
};

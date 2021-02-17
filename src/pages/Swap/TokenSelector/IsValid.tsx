import React from 'react';
import { Icon } from 'semantic-ui-react';

export const IsValid = (props: { isValid: boolean }) => {
  return props.isValid ? <Icon name={'checkmark'} color={'green'} /> : <Icon name={'close'} color={'red'} />;
};

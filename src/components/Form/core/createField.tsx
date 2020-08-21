import * as React from 'react';
import { IFieldParams, IMobxFormItemProps, MobxFormItem } from './MobxFormItem';

export function createField<T>(fieldParams: IFieldParams<T>) {
  return (props: IMobxFormItemProps & T) => {
    return (
      <MobxFormItem
        {...props}
        fieldParams={fieldParams}
        {...(fieldParams.mobxFormItemProps || {})}
      />
    );
  };
}

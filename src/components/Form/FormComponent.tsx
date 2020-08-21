import * as React from 'react';
import { Input, TOptions } from './Fields';

export type TFormFieldBase<T = any, F extends keyof T | string = any> = {
  field: F | null;
} & TOptions & {
    type?: any;
    value?: any;
    title?: string;
    disabled?: boolean;
    required?: boolean;
    className?: string;
    props?: any;
    rules?: any[];
    isShow?: boolean;
    genOptions?(props?: any): any[];
  };

export class FormComponent<T, F extends keyof T> extends React.Component<TFormFieldBase<T, F>> {
  render() {
    const { isShow = true } = this.props;

    if (!isShow) {
      return null;
    }

    const cmpProps = { ...this.props, name: String(this.props.field) };

    // TODO: fields naming

    switch (this.props.type) {
      default:
        return <Input {...(cmpProps as any)} />;
    }
  }
}

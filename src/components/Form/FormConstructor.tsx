import { Box, BoxProps } from 'grommet';
import { observer } from 'mobx-react';
import * as React from 'react';
import { IWrappedComponent, MobxForm, createField } from './core';
import { FormComponent, TFormFieldBase } from './FormComponent';

export type TRules = any[];

export interface TFormFieldContainer<T> {
  type: 'container';
  className?: string;
  props?: BoxProps;
  options: Array<TFormFieldParams<T>>;
}

export interface TFormFieldCustom<T> {
  type: 'custom';
  props?: any;
  rules?: TRules[];
  component: any;
  [propsName: string]: any;
}

export type TFormFieldParams<T extends Record<string, any> = any> =
  | TFormFieldBase<T, keyof T>
  | TFormFieldContainer<T>
  | TFormFieldCustom<T>;

interface IFormConstructorProps<T> {
  config: Array<TFormFieldParams<T>>;
  data?: any;
  boxProps?: any;
  renderElement?: string;
  className?: string;
  style?: React.CSSProperties;
  prefix?: string;
  children?: React.ReactNode;
  layout?: 'horizontal' | 'vertical' | 'inline';
  ref?: any;
  validateFieldsOnly?: string[];
  onSubmit?(e: Event): void;
  onValidSubmit?(): void;
}

@observer
export class FormConstructor extends MobxForm<IFormConstructorProps<any>> {
  prefix: any;

  constructor(props: IFormConstructorProps<any>) {
    super(props as any);

    this.prefix = this.props.prefix;
  }

  handlerOnSubmit = (e: Event) => {
    e.preventDefault();

    if (this.props.onSubmit) {
      this.props.onSubmit(e);
    }

    if (this.props.onValidSubmit) {
      this.validateFields().then(this.props.onValidSubmit).catch();
    }
  };

  renderFormOptions = (options: any): any =>
    options.map((params: any, index: number) => {
      const field = params.field || `f_${index}`;
      const key = `${params.type}_${field}_${index}`;

      const isFirst = index === 0;
      const isLast = options.length - index === 1;

      const cmpProps = { ...params, isFirst, isLast, field };

      switch (params.type) {
        case 'container':
          return (
            <Box key={key} {...params.props} className={params.className}>
              {this.renderFormOptions(params.options)}
            </Box>
          );

        case 'custom':
          const Custom = createField({ wrapper: Box, component: params.component });

          return <Custom key={key} {...cmpProps} name={field} />;

        default:
          return cmpProps.visible === false ? null : <FormComponent key={key} {...cmpProps} />;
      }
    });

  WrappedComponent: IWrappedComponent<IFormConstructorProps<any>> = (
    props: IFormConstructorProps<any>
  ) => {
    const { renderElement } = props;
    const renderTagName = renderElement || 'form';

    const formProps = {
      onSubmit: renderTagName === 'form' ? this.handlerOnSubmit : null,
    };

    return React.createElement(
      renderTagName,
      { ...props, ...formProps },
      this.renderFormOptions(this.props.config)
    );
  };
}

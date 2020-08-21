import cn from 'classnames';
import * as React from 'react';
import { MobxForm, IWrappedComponent } from './core';

const defaultClassName = 'ant-form';

export interface IFormProps {
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

export class Form extends MobxForm<IFormProps> {
  public prefix: any;

  constructor(props: IFormProps) {
    super(props as any);

    this.prefix = this.props.prefix;
  }

  public handlerOnSubmit = (e: Event) => {
    e.preventDefault();

    if (this.props.onSubmit) {
      this.props.onSubmit(e);
    }

    if (this.props.onValidSubmit) {
      this.validateFields().then(this.props.onValidSubmit).catch();
    }
  };

  public WrappedComponent: IWrappedComponent<IFormProps> = (props: IFormProps) => {
    const { renderElement, className, layout = 'vertical', children } = props;
    const renderTagName = renderElement || 'form';

    const formProps = {
      className: cn(defaultClassName, className, layout),
      onSubmit: renderTagName === 'form' ? this.handlerOnSubmit : null,
      style: { width: '100%' },
    };

    return React.createElement(renderTagName, formProps, children);
  };
}

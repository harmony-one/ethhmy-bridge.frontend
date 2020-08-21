import { observable } from 'mobx';
import { observer } from 'mobx-react';
import { MobxForm, IWrappedComponent } from './MobxForm';

interface IOptions {
  prefix?: string;
  defaultItemProps?: object;
}

export const creatForm = (options: IOptions = {}) =>
  function decorate(WrappedComponent: IWrappedComponent<any>) {
    const t = class Test extends MobxForm<any> {
      public WrappedComponent = WrappedComponent;
      public prefix = options.prefix || '';
      public defaultItemProps = options.defaultItemProps || {};
      public errors = observable(new Map());
      public fieldOptions = observable(new Map());
    };

    return observer(t);
  };

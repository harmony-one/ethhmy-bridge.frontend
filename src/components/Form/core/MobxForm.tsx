import AsyncValidator from 'async-validator';
import { autobind } from 'core-decorators';
import * as _ from 'lodash';
import { action, computed, observable, toJS } from 'mobx';
import { observer, PropTypes } from 'mobx-react';
import * as React from 'react';
import { getValueFromEvent } from '../helpers';

export type IRuleFunc = (cb: (errors: string[]) => void) => void;
export type ITypeRule =
  | 'object'
  | 'string'
  | 'boolean'
  | 'array'
  | 'date'
  | 'enum'
  | 'float'
  | 'integer'
  | 'null'
  | 'number'
  | 'regexp';

export type IMessageFunc = (message: string, parameters: any) => string;

export type IValidator = (rule: any, value: any, callback: any, source: any, options: any) => void;

/**
 * {@link https://www.npmjs.com/package/async-validate#rules Document Rules}
 */
export interface IRuleObj {
  type?: ITypeRule | ITypeRule[] | string | string[];
  required?: boolean;
  min?: number;
  max?: number;
  len?: number;
  fields?: {
    [key: string]: IRuleObj;
  };
  // for  type: "enum",
  list?: any[];
  validateType?: string;
  whitespace?: boolean;
  validator?: IValidator;
  additional?: boolean;
  format?: string;
  pattern?: RegExp;
  match?: RegExp;
  message?: React.ReactNode | IMessageFunc;
  placeholder?(): string;
  resolve?(): any;
  // Determines if additional properties are allowed.
  // for type: "date",
  // for  type: "object",
}

export type IRule = IRuleObj[] | IRuleObj;

export interface IMobxFormProps {
  form?: object;
  data?: any;
  type?: any;
  editable?: boolean;
  onSubmit?: () => void;
  validateFieldsOnly?: string[];
  defaultItemProps?: object;
  ref?(form: MobxForm): void;
  rootRef?(form: JSX.Element): void;
  // children?: React.ReactChildren;
}

export interface IErrorField {
  field: string;
  message: string;
}

export interface IErrorFields {
  [key: string]: IErrorField[];
}

export interface IWrappedComponentProps {
  children?: React.ReactNode;
  form?: MobxForm;
  ref?: React.Ref<HTMLFormElement>;
}

export interface IFieldOptions {
  rules: IRule;
  // TODO: add method
}

export type IWrappedComponent<T = {}> =
  | React.SFC<T & IWrappedComponentProps>
  | React.ComponentClass<T & IWrappedComponentProps>;

const DEFAULT_VALIDATE_TRIGGER = 'onChange';
const DEFAULT_TRIGGER = DEFAULT_VALIDATE_TRIGGER;

@observer
export class MobxForm<T = {}> extends React.Component<IMobxFormProps & T, any> {
  public static childContextTypes = {
    form: PropTypes.observableObject, // the form object
    defaultItemProps: PropTypes.observableObject, // global default FormItem props
  };
  public static defaultProps = {
    editable: true,
  };

  @observable public _store = {};
  @observable public errors = new Map<string, IErrorField[]>();
  @observable public fieldOptions = new Map<string, IFieldOptions>();
  @observable public fieldTouched = new Map<string, boolean>();

  public prefix?: string;
  public defaultItemProps?: object;
  public WrappedComponent: IWrappedComponent<T> = props => <form {...props} />;

  @computed
  get fieldsNames(): string[] {
    return Array.from(this.fieldOptions.keys());
  }

  @computed
  get store() {
    return this.props.data || this._store;
  }

  public getChildContext(): any {
    return {
      form: this,
      defaultItemProps: this.defaultItemProps,
    };
  }

  @autobind
  public getFieldDecorator(name: string, customFieldOption = {}) {
    return (element: any) =>
      React.cloneElement(element, this.getFieldProps(name, customFieldOption));
  }

  @autobind
  public getFieldError(name: string): IErrorField[] {
    if (!this.errors.has(name)) {
      this.errors.set(name, []);
    }
    return this.errors.get(name);
  }

  @autobind
  public getFieldsError(): Map<string, IErrorField[]> {
    return toJS(this.errors);
  }

  @autobind
  public isEditable(): boolean {
    return this.props.editable;
  }

  @autobind
  public getFieldProps(name: string, customFieldOption = {}) {
    const store = this.store;
    if (!store) {
      throw new Error('Must pass `store` with Mobx instance.');
    }
    if (!name) {
      throw new Error('Must call `getFieldProps` with valid name string!');
    }

    const storeOptions = (store.__options && store.__options[name]) || {};
    const fieldOption = {
      getValueFromEvent,
      name,
      valuePropName: 'value',
      trigger: DEFAULT_TRIGGER,
      validateTrigger: DEFAULT_VALIDATE_TRIGGER,
      appendProps: {},
      ...storeOptions,
      ...customFieldOption,
    };
    const {
      trigger,
      validateTrigger,
      valuePropName,
      parseValue,
      appendProps,
      // initialValue,
      otherProps,
    } = fieldOption;
    const value = this.getFieldValue(name);
    this.setFieldOption(name, fieldOption);
    this.setStartFilchedFiled(name);
    const props = {
      [valuePropName]: parseValue ? parseValue(value) : value,
      [trigger]: this.createHandler(fieldOption),
      'data-field-name': name,
      ...appendProps,
      ...otherProps,
    };
    if (!this.isEditable()) {
      props.disabled = true;
    }
    if (validateTrigger !== trigger) {
      props[validateTrigger] = this.createValidateHandler(fieldOption);
    }
    return props;
  }

  @action.bound
  public setFieldOption(name: string, value: IFieldOptions) {
    this.fieldOptions.set(name, value);
  }

  @action.bound
  public removeField(name: string) {
    this.fieldOptions.delete(name);
    this.fieldTouched.delete(name);
  }

  public getTargetFields() {
    const store = this.store;
    return this.prefix ? _.get(store, this.prefix) : store;
  }

  @autobind
  public getFieldValue(path: string, defaultValue?: any) {
    return toJS(
      _.get(this.store, this.prefix ? [this.prefix, path].join('.') : path, defaultValue)
    );
  }

  @action.bound
  public setField(path: string, value: any) {
    const store = this.store;
    return _.set(store, this.prefix ? [this.prefix, path].join('.') : path, value);
  }

  @action.bound
  public setStartFilchedFiled(name: string) {
    if (!this.fieldTouched.has(name)) {
      this.fieldTouched.set(name, false);
    }
  }

  @action.bound
  public touchedField(name: string) {
    this.fieldTouched.set(name, true);
  }

  public _getAllowRules(fieldName: any, rules: any) {
    const { validateFieldsOnly } = this.props;

    let allowFieldRules = rules;

    if (
      _.isArray(allowFieldRules) &&
      _.isArray(validateFieldsOnly) &&
      validateFieldsOnly.indexOf(fieldName) === -1
    ) {
      allowFieldRules = allowFieldRules.filter(
        rule => !rule.required && !(rule.validateType === 'requiredValidator')
      );
    }

    return allowFieldRules;
  }

  @action.bound
  public validateFields(): Promise<any> {
    this.fieldsNames.forEach(name => this.fieldTouched.set(name, true));

    const needValidateName: any = [];
    const rules = this.fieldsNames.reduce((o, name) => {
      const fieldRules = toJS(this.fieldOptions.get(name).rules);
      if ((!_.isArray(fieldRules) && fieldRules) || (_.isArray(fieldRules) && fieldRules.length)) {
        const allowRules = this._getAllowRules(name, fieldRules);

        if (allowRules && allowRules.length) {
          needValidateName.push(name);
          o[name] = allowRules;
        }
      }

      return o;
    }, {});

    const validator = new AsyncValidator(rules);
    return new Promise((resolve, reject) => {
      const values = toJS(this.getTargetFields());
      // flatten values that need validate
      const flattenValue = needValidateName.reduce((o: any, cur: any) => {
        o[cur] = this.getFieldValue(cur);
        return o;
      }, {});

      validator.validate(flattenValue, (err: IErrorField[], fields: IErrorFields) => {
        if (fields) {
          this.resetErrors();
          return reject(fields);
        }
        return resolve(values);
      });
    }).catch(
      action(errors => {
        const ErrorMap = new Map();
        for (const name in errors) {
          if (errors[name]) {
            ErrorMap.set(name, errors[name]);
          }
        }
        this.errors = ErrorMap;
        return Promise.reject(errors);
      })
    );
  }

  @action.bound
  public validateField(name: string, value: any, rules: IRule): Promise<void> {
    const allowRules = this._getAllowRules(name, rules);

    if (!allowRules || !allowRules.length) {
      return Promise.resolve();
    }

    return new Promise((res, rej) => {
      const validator = new AsyncValidator({ [name]: allowRules });
      validator.validate(
        { ...this.store, [name]: value },
        action((err: IErrorField[], fields: IErrorFields) => {
          this.errors.set(name, err || []);
          res();
        }) as any
      );
    });
  }

  public createHandler({ name, onChange }: any) {
    return (e: any) => {
      const value = getValueFromEvent(e);
      if (this.isEditable()) {
        if (onChange) {
          onChange(value);
        }
        this.setField(name, value);
      }
    };
  }

  public createValidateHandler({ name, rules }: any) {
    return (e: any) => {
      const value = getValueFromEvent(e);
      this.validateField(name, value, rules);
    };
  }

  @action.bound
  public resetErrors(): void {
    this.fieldsNames.forEach(name => {
      this.errors.delete(name);
      this.errors.set(name, []);
    });
  }

  @action.bound
  public resetTouched() {
    this.fieldsNames.forEach(name => {
      this.fieldTouched.set(name, false);
    });
  }

  @action.bound
  public resetValue() {
    this.fieldsNames.forEach(name => {
      this.setField(name, null);
    });
  }

  @action.bound
  public reset(isResetValue = true) {
    if (isResetValue) {
      this.resetValue();
    }
    this.resetErrors();
    this.resetTouched();
  }

  public render() {
    const WrappedComponent = this.WrappedComponent as any;
    return <WrappedComponent {...this.props} form={this} ref={this.props.rootRef} />;
  }
}

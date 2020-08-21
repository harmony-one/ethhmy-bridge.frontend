import { PureComponent, ReactNode } from 'react';

export class Case extends PureComponent<IProps> {
  public static isCase(item: any): item is Case {
    return true; // item && item.case;
  }

  public case: true;

  public render(): ReactNode {
    return this.props.children;
  }
}

interface IProps {
  value: string | number | boolean;
}
